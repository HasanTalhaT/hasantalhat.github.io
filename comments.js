// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyCJVsDJHseV2VwXyHNtAQT0lyHJIy0pKPA",
    authDomain: "jshasan-fe32e.firebaseapp.com",
    databaseURL: "https://jshasan-fe32e-default-rtdb.firebaseio.com",
    projectId: "jshasan-fe32e",
    storageBucket: "jshasan-fe32e.appspot.com",
    messagingSenderId: "818860975877",
    appId: "1:818860975877:web:f5fe21d6108d760f69f96c",
    measurementId: "G-CVKQL2S1BH"
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