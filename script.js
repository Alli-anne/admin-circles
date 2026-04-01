// DO NOT RUN THIS FILE WITH NODE.JS
// This file is loaded by the browser via the HTML <script> tag.

document.addEventListener('DOMContentLoaded', () => {
  const loadPosts = () => {
    fetch("comments.json")
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById("postsContainer");
        if (!container) return;
        container.innerHTML = ""; 

        data.posts.forEach((post, index) => {
          const postDiv = document.createElement("div");
          postDiv.classList.add("post-card");
          const tagsHTML = post.tags ? post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : '';

          postDiv.innerHTML = `
            <div class="post-header">
              <img class="avatar" src="${post.header.profile_picture}" alt="profile">
              <div class="user-info">
                <span class="author-name">${post.header.author}</span>
                <span class="author-meta">${post.header.role} • ${post.header.place}</span>
              </div>
              <span class="post-time">${post.header.time}</span>
            </div>
            <div class="post-body"><p>${post.content.body}</p></div>
            <div class="post-tags">${tagsHTML}</div>
            <div class="post-footer">
              <div class="comment-input-wrapper">
                <div class="comment-placeholder" contenteditable="true">${post.response ? post.response.text : "Write a response..."}</div>
                <img src="css/images/send.svg" class="send-icon" alt="send">
              </div>
              <button class="view-comments" data-id="${index}">View ${post.comments.length} Comments</button>
              <div class="comments-list" id="comments-${index}" style="display:none; margin-top:10px;">
                ${post.comments.map(c => `<div class="comment-item"><strong>${c.commenter.name}:</strong> ${c.text}</div>`).join('')}
              </div>
            </div>`;
          container.appendChild(postDiv);
        });
      });
  };

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('send-icon')) {
      const input = e.target.closest('.comment-input-wrapper').querySelector('[contenteditable]');
      if (input.innerText.trim() !== "") { alert("Response shared!"); input.innerText = ""; }
    }
    if (e.target.classList.contains('view-comments')) {
      const list = document.getElementById(`comments-${e.target.dataset.id}`);
      list.style.display = list.style.display === 'none' ? 'block' : 'none';
    }
  });

  loadPosts();
});