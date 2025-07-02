import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";

admin.initializeApp();

const MODERATED_WORDS = [
  "idiota",
  "estúpido",
  "tonto",
  "maldito",
  "carajo",
  "jodido",
  "pendejo",
  "cabrón",
  "hijo de puta",
  "puta",
  "mierda",
  "coño",
];

/**
 * Moderates a given text by replacing with "[redacted]".
 *
 * @param {string} text - The input text to be moderated.
 * @return {string} The moderated text with prohibited words replaced.
 */
function moderateContent(text: string): string {
  let moderatedText = text;
  MODERATED_WORDS.forEach((word) => {
    const regex = new RegExp(word, "gi");
    moderatedText = moderatedText.replace(regex, "[redacted]");
  });
  return moderatedText;
}

export const moderatePost = onDocumentCreated(
  "posts/{postId}",
  async (event) => {
    const snap = event.data;
    const postId = event.params.postId;

    if (!snap) {
      console.log("No data associated with the event");
      return;
    }

    const postData = snap.data();
    const originalContent = postData.content || "";
    const moderatedContent = moderateContent(originalContent);

    if (originalContent !== moderatedContent) {
      await snap.ref.update({
        content: moderatedContent,
        moderated: true,
        moderatedAt: FieldValue.serverTimestamp(),
      });

      const db = admin.firestore();
      const notificationId = db.collection("notifications").doc().id;
      const notificationRef = db.collection("notifications")
        .doc(notificationId);

      await notificationRef.set({
        id: notificationId,
        userId: postData.userId,
        fromUserId: "system",
        fromUserName: "Sistema",
        fromUserPhoto: "",
        postId: postId,
        type: "moderation",
        message: "Tu publicación fue moderada por contenido inapropiado",
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });

      await sendPushNotification({
        userId: postData.userId,
        title: "Publicación moderada",
        body: "Tu publicación fue moderada por contenido inapropiado",
        data: {
          type: "moderation",
          postId: postId,
          fromUserId: "system",
          fromUserName: "Sistema",
          notificationId: notificationId,
        },
      });
    }
    return null;
  }
);

interface LikeDislikeData {
  postId: string;
  action: "like" | "dislike";
  userId: string;
}

export const handleLikeDislike = onCall<LikeDislikeData>(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "El usuario debe estar autenticado para dar like/dislike."
    );
  }

  const {postId, action, userId} = request.data;
  const currentUserId = request.auth.uid;

  if (!postId || !action || !userId) {
    throw new HttpsError(
      "invalid-argument",
      "postId, action y userId son requeridos."
    );
  }

  if (action !== "like" && action !== "dislike") {
    throw new HttpsError(
      "invalid-argument",
      "action debe ser \"like\" o \"dislike\"."
    );
  }

  try {
    const db = admin.firestore();
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new HttpsError("not-found", "El post no existe.");
    }

    const postData = postDoc.data()!;
    const postOwnerId = postData.userId;

    if (currentUserId === postOwnerId) {
      throw new HttpsError(
        "permission-denied",
        "No puedes dar like/dislike a tu propio post."
      );
    }

    const userDoc = await db.collection("users").doc(currentUserId).get();
    const userData = userDoc.data();
    const userName = userData?.displayName || userData?.name ||
        "Usuario anónimo";
    const userPhoto = userData?.photoURL || "";

    const existingLikeDislike = await db
      .collection("likes_dislikes")
      .where("postId", "==", postId)
      .where("userId", "==", currentUserId)
      .get();

    if (!existingLikeDislike.empty) {
      const batch = db.batch();
      existingLikeDislike.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      const previousAction = existingLikeDislike.docs[0].data().action;
      const decrementData: any = {};

      if (previousAction === "like") {
        decrementData.likesCount = FieldValue.increment(-1);
      } else {
        decrementData.dislikesCount = FieldValue.increment(-1);
      }

      await postRef.update(decrementData);
    }

    const likeDislikeRef = db.collection("likes_dislikes").doc();
    await likeDislikeRef.set({
      postId: postId,
      userId: currentUserId,
      action: action,
      createdAt: FieldValue.serverTimestamp(),
    });

    const increment = FieldValue.increment(1);
    const updateData: any = {};

    if (action === "like") {
      updateData.likesCount = increment;
    } else {
      updateData.dislikesCount = increment;
    }

    await postRef.update(updateData);

    if (currentUserId !== postOwnerId) {
      const notificationId = db.collection("notifications").doc().id;
      const notificationRef =
          db.collection("notifications").doc(notificationId);

      const notificationMessage = action === "like" ?
        `A ${userName} le gustó tu publicación` :
        `A ${userName} no le gustó tu publicación`;

      const notificationData = {
        id: notificationId,
        userId: postOwnerId,
        fromUserId: currentUserId,
        fromUserName: userName,
        fromUserPhoto: userPhoto,
        postId: postId,
        type: action,
        message: notificationMessage,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      };

      console.log("Creating notification with data:", notificationData);
      await notificationRef.set(notificationData);

      await sendPushNotification({
        userId: postOwnerId,
        title: action === "like" ? "¡Le gustó tu publicación!" :
          "Reacción a tu publicación",
        body: notificationMessage,
        data: {
          type: action,
          postId: postId,
          fromUserId: currentUserId,
          fromUserName: userName,
          fromUserPhoto: userPhoto,
          notificationId: notificationId,
        },
      });
    }

    return {success: true};
  } catch (error) {
    console.error("Error en handleLikeDislike:", error);
    throw new HttpsError("internal", "Error interno del servidor.");
  }
});

/**
 * Sends a push notification to a specific user.
 *
 * @param {Object} params - The parameters for sending the push notification.
 * @param {string} params.userId - The unique identifier.
 * @param {string} params.title - The title of the notification.
 * @param {string} params.body - The body content of the notification.
 * @param {Object} params.data - Additional data.
 * @param {string} [params.data.type] - The type of the notification.
 * @param {string} [params.data.postId] - Associated post ID if applicable.
 * @param {string} [params.data.fromUserId] - The user ID of the sender.
 * @param {string} [params.data.fromUserName] - The name of the sender.
 * @param {string} [params.data.fromUserPhoto] - The photo URL of the sender.
 * @param {string} [params.data.notificationId] - A unique identifier.
 * @return {Promise<void>} Resolves.
 */
async function sendPushNotification(params: {
  userId: string;
  title: string;
  body: string;
  data: any;
}) {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(params.userId).get();
    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;

    if (!fcmToken) {
      console.log(`No FCM token found for user ${params.userId}`);
      return;
    }

    const message = {
      token: fcmToken,
      notification: {
        title: params.title,
        body: params.body,
      },
      data: {
        type: params.data.type || "",
        postId: params.data.postId || "",
        fromUserId: params.data.fromUserId || "",
        fromUserName: params.data.fromUserName || "",
        fromUserPhoto: params.data.fromUserPhoto || "",
        notificationId: params.data.notificationId || "",
      },
    };

    await admin.messaging().send(message);
    console.log("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

export const getUserNotifications = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "El usuario debe autenticar.");
  }

  const userId = request.auth.uid;
  const db = admin.firestore();

  try {
    const notificationsSnapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const notifications = notificationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log("Notification data:", data);

      return {
        id: doc.id,
        userId: data.userId || "",
        fromUserId: data.fromUserId || "",
        fromUserName: data.fromUserName || "Usuario desconocido",
        fromUserPhoto: data.fromUserPhoto || "",
        postId: data.postId || "",
        type: data.type || "",
        message: data.message || "Notificación sin mensaje",
        read: data.read || false,
        createdAt: data.createdAt,
        readAt: data.readAt || null,
      };
    });

    console.log("Returning notifications:", notifications.length);
    return {notifications};
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    throw new HttpsError("internal", "Error obteniendo notificaciones.");
  }
});

interface MarkNotificationData {
  notificationId: string;
}

export const markNotificationAsRead = onCall<MarkNotificationData>(
  {cors: true},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "El usuario debe autenticar.");
    }

    const {notificationId} = request.data;
    const userId = request.auth.uid;

    if (!notificationId) {
      throw new HttpsError("invalid-argument", "notificationId es requerido.");
    }

    try {
      const db = admin.firestore();
      const notificationRef = db.collection("notifications")
        .doc(notificationId);
      const notificationDoc = await notificationRef.get();

      if (!notificationDoc.exists) {
        throw new HttpsError("not-found", "La notificación no existe.");
      }

      const notificationData = notificationDoc.data()!;

      if (notificationData.userId !== userId) {
        throw new HttpsError(
          "permission-denied",
          "No tienes permiso para modificar esta notificación."
        );
      }

      await notificationRef.update({
        read: true,
        readAt: FieldValue.serverTimestamp(),
      });

      return {success: true};
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
      throw new HttpsError("internal", "Error marcando como leída.");
    }
  }
);
