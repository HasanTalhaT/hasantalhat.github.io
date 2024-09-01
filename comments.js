const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_REPO = 'HasanTalhaT/hasan'; // GitHub kullanıcı adı ve depo adı
const GITHUB_FILE_PATH = 'comments.json'; // Yorumların saklanacağı dosya yolu
const GITHUB_TOKEN = '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'; // Kişisel erişim belirteci

// Load comments from GitHub when the page loads
document.addEventListener('DOMContentLoaded', async (event) => {
    await loadComments();
});

async function addComment() {
    var commentInput = document.getElementById('commentInput');
    var commentList = document.getElementById('commentList');

    if (commentInput.value.trim() !== "") {
        var newComment = {
            text: commentInput.value
        };

        // Save the new comment to GitHub
        await saveComment(newComment);

        // Add the new comment to the list
        var newCommentElement = document.createElement('li');
        newCommentElement.textContent = newComment.text;
        commentList.appendChild(newCommentElement);
        commentInput.value = "";
    }
}

async function saveComment(comment) {
    var comments = await fetchComments();
    comments.push(comment);

    const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Add new comment',
            content: btoa(JSON.stringify(comments)),
            sha: await getFileSha()
        })
    });

    if (!response.ok) {
        throw new Error('Failed to save comment');
    }
}

async function loadComments() {
    var comments = await fetchComments();
    var commentList = document.getElementById('commentList');
    commentList.innerHTML = ''; // Clear existing comments
    comments.forEach(function(comment) {
        var newCommentElement = document.createElement('li');
        newCommentElement.textContent = comment.text;
        commentList.appendChild(newCommentElement);
    });
}

async function fetchComments() {
    const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            return []; // File not found, return empty array
        }
        throw new Error('Failed to fetch comments');
    }

    const data = await response.json();
    return JSON.parse(atob(data.content));
}

async function getFileSha() {
    const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null; // File not found, return null
        }
        throw new Error('Failed to fetch file SHA');
    }

    const data = await response.json();
    return data.sha;
}