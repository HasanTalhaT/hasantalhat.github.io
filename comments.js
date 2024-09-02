// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase başlatma
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);

// Yorumları yükleme
document.addEventListener('DOMContentLoaded', (event) => {
    loadComments();
});

function addComment() {
    var commentInput = document.getElementById('commentInput');
    var commentList = document.getElementById('commentList');

    if (commentInput.value.trim() !== "") {
        var newComment = {
            text: commentInput.value
        };

        // Yorumları Firebase'e kaydetme
        saveComment(newComment);

        // Yeni yorumu listeye ekleme
        var newCommentElement = document.createElement('li');
        newCommentElement.textContent = newComment.text;
        commentList.appendChild(newCommentElement);
        commentInput.value = "";
    }
}

function saveComment(comment) {
    const commentsRef = database.ref('comments');
    commentsRef.push(comment);
}

function loadComments() {
    const commentsRef = database.ref('comments');
    commentsRef.on('value', (snapshot) => {
        var comments = snapshot.val();
        var commentList = document.getElementById('commentList');
        commentList.innerHTML = ''; // Mevcut yorumları temizle
        for (var id in comments) {
            var comment = comments[id];
            var newCommentElement = document.createElement('li');
            newCommentElement.textContent = comment.text;
            commentList.appendChild(newCommentElement);
        }
    });
}