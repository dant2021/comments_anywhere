"use strict";
/// <reference types="chrome"/>
// State
let isCommentMode = false;
let threads = [];
// Mock users (in a real app, this would come from a backend)
const users = [
    { id: 'user1', name: 'Antoine', avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJ87dyXD69Rb_aIGzrXNQzrpwWlaCjnE3JzpTebRGY8Ww5a3so=s48-c' },
    { id: 'user2', name: 'Stacy', avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjWSS9X3qCyqV1e2wAAoPUkMQUkl1u233byufjJuFATtQrxb38I=s48-c' },
];
let currentUser = users[0];
function init() {
    // Chrome runtime message listener
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "toggleCommentMode") {
            toggleCommentMode();
            sendResponse({ status: "success" });
        }
    });
    // Click event listener for creating new threads
    document.addEventListener('click', handleClick);
    // Mousemove event listener for updating cursor position
    document.addEventListener('mousemove', updateCursorPosition);
}
function toggleCommentMode() {
    if (!isCommentMode) {
        isCommentMode = true;
        createNewThreadCursor();
        document.body.style.cursor = 'none';
        showReaction('Comment mode activated!');
    }
    else {
        resetCommentMode();
    }
}
function handleClick(e) {
    if (isCommentMode) {
        promptForComment(e.clientX, e.clientY);
        e.preventDefault();
    }
}
function createNewThreadCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'newThreadCursor';
    document.body.appendChild(cursor);
    // Set the background image of the cursor to the current user's avatar
    cursor.style.setProperty('--user-avatar', `url('${currentUser.avatar}')`);
}
function removeNewThreadCursor() {
    const cursor = document.querySelector('.newThreadCursor');
    if (cursor) {
        cursor.remove();
    }
}
function updateCursorPosition(e) {
    const cursor = document.querySelector('.newThreadCursor');
    if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    }
}
function showReaction(message) {
    const reaction = document.createElement('div');
    reaction.textContent = message;
    reaction.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    z-index: 10000;
    transition: opacity 0.3s ease-in-out;
  `;
    document.body.appendChild(reaction);
    setTimeout(() => {
        reaction.style.opacity = '0';
        setTimeout(() => reaction.remove(), 300);
    }, 2000);
}
function promptForComment(x, y, threadId) {
    resetCommentMode(); // This will turn off comment mode immediately
    const commentForm = document.createElement('div');
    commentForm.className = 'draggableThread';
    commentForm.style.position = 'absolute';
    commentForm.style.left = `${x}px`;
    commentForm.style.top = `${y}px`;
    const formContent = document.createElement('div');
    formContent.className = 'reply-form';
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Enter your comment...';
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.className = 'reply-button';
    submitButton.onclick = () => {
        const comment = textarea.value;
        if (comment) {
            const mentions = extractMentions(comment);
            if (threadId) {
                addCommentToThread(threadId, comment, mentions);
            }
            else {
                createThread(x, y, comment, mentions);
            }
        }
        commentForm.remove();
        showReaction('Comment added.');
    };
    formContent.appendChild(textarea);
    formContent.appendChild(submitButton);
    commentForm.appendChild(formContent);
    document.body.appendChild(commentForm);
}
function resetCommentMode() {
    isCommentMode = false;
    removeNewThreadCursor();
    document.body.style.cursor = 'default';
    showReaction('Comment mode deactivated.');
}
function extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const mentions = text.match(mentionRegex) || [];
    return mentions.map(mention => mention.slice(1));
}
function createThread(x, y, comment, mentions) {
    const thread = {
        id: Date.now().toString(),
        comments: [{
                id: Date.now().toString(),
                body: comment,
                userId: currentUser.id,
                createdAt: new Date().toISOString(),
                mentions
            }],
        metadata: { x, y },
        createdAt: new Date().toISOString()
    };
    threads.push(thread);
    renderThread(thread);
}
function addCommentToThread(threadId, comment, mentions) {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
        thread.comments.push({
            id: Date.now().toString(),
            body: comment,
            userId: currentUser.id,
            createdAt: new Date().toISOString(),
            mentions
        });
        renderThread(thread);
    }
}
function renderThread(thread) {
    const existingThread = document.getElementById(`thread-${thread.id}`);
    if (existingThread) {
        existingThread.remove();
    }
    const threadEl = document.createElement('div');
    threadEl.id = `thread-${thread.id}`;
    threadEl.className = 'draggableThread';
    threadEl.style.transform = `translate3d(${thread.metadata.x}px, ${thread.metadata.y}px, 0)`;
    const commentsEl = document.createElement('div');
    commentsEl.className = 'thread-comments';
    thread.comments.forEach((comment, index) => {
        const commentEl = renderComment(comment);
        commentsEl.appendChild(commentEl);
    });
    const replyForm = createReplyForm(thread.id);
    threadEl.appendChild(commentsEl);
    threadEl.appendChild(replyForm);
    document.body.appendChild(threadEl);
}
function renderComment(comment) {
    const commentEl = document.createElement('div');
    commentEl.className = 'comment';
    const user = users.find(u => u.id === comment.userId);
    const avatarEl = document.createElement('div');
    avatarEl.className = 'comment-avatar';
    avatarEl.style.backgroundImage = `url("${user?.avatar}")`;
    const contentEl = document.createElement('div');
    contentEl.className = 'comment-content';
    const nameEl = document.createElement('strong');
    nameEl.textContent = user?.name || 'Unknown User';
    const bodyEl = document.createElement('p');
    bodyEl.innerHTML = highlightMentions(comment.body);
    contentEl.appendChild(nameEl);
    contentEl.appendChild(bodyEl);
    commentEl.appendChild(avatarEl);
    commentEl.appendChild(contentEl);
    return commentEl;
}
function createReplyForm(threadId) {
    const formEl = document.createElement('div');
    formEl.className = 'reply-form';
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Reply to thread...';
    const buttonEl = document.createElement('button');
    buttonEl.textContent = 'Reply';
    buttonEl.className = 'reply-button';
    buttonEl.onclick = () => {
        const comment = textarea.value;
        if (comment) {
            const mentions = extractMentions(comment);
            addCommentToThread(threadId, comment, mentions);
            textarea.value = '';
        }
    };
    formEl.appendChild(textarea);
    formEl.appendChild(buttonEl);
    return formEl;
}
function highlightMentions(text) {
    return text.replace(/@(\w+)/g, (match, name) => {
        const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
        if (user) {
            return `<span class="mention" style="color: blue; font-weight: bold;">@${user.name}</span>`;
        }
        return match;
    });
}
init();
console.log("Content script loaded");
