// Load comments from localStorage when the page loads
document.addEventListener('DOMContentLoaded', (event) => {
    loadComments();
});

async function addComment() {
    var commentInput = document.getElementById('commentInput');
    var commentList = document.getElementById('commentList');

    if (commentInput.value.trim() !== "") {
        var newComment = {
            text: commentInput.value
        };

        // Save the new comment to localStorage
        saveComment(newComment);

        // Add the new comment to the list
        var newCommentElement = document.createElement('li');
        newCommentElement.textContent = newComment.text;
        commentList.appendChild(newCommentElement);
        commentInput.value = "";

        // Automatically sync comments after adding a new one
        await syncComments();
    }
}

function saveComment(comment) {
    var comments = JSON.parse(localStorage.getItem('comments')) || [];
    comments.push(comment);
    localStorage.setItem('comments', JSON.stringify(comments));
}

function loadComments() {
    var comments = JSON.parse(localStorage.getItem('comments')) || [];
    var commentList = document.getElementById('commentList');
    comments.forEach(function(comment) {
        var newCommentElement = document.createElement('li');
        newCommentElement.textContent = comment.text;
        commentList.appendChild(newCommentElement);
    });
}

async function syncComments() {
    var comments = JSON.parse(localStorage.getItem('comments')) || [];

    try {
        // Send the comments to the server
        const response = await fetch('http://your-server-url/comments.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comments)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Clear localStorage after successful sync
        localStorage.removeItem('comments');
        alert('Comments synced successfully!');
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}