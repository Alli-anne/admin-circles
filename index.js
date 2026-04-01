document.addEventListener('DOMContentLoaded', () => {
  
  // 1. FETCH AND RENDER POSTS FROM JSON
  const loadPosts = () => {
    fetch("comments.json")
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById("postsContainer");
        if (!container) return;

        container.innerHTML = ""; // Clear for fresh load

        data.posts.forEach((post, index) => {
          const postDiv = document.createElement("div");
          postDiv.classList.add("post-card"); // Using modern class names

          // Generate Tags HTML
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

            <div class="post-body">
              <p>${post.content.body}</p>
            </div>

            <div class="post-tags">${tagsHTML}</div>

            <div class="post-footer">
              <div class="comment-input-wrapper">
                <div class="comment-placeholder" contenteditable="true">
                  ${post.response ? post.response.text : "Write a response..."}
                </div>
                <img src="css/images/send.svg" class="send-icon" alt="send">
              </div>
              <button class="view-comments" data-id="${index}">View ${post.comments.length} Comments</button>
              <div class="comments-list" id="comments-${index}" style="display:none; margin-top:10px;">
                ${post.comments.map(c => `
                  <div class="comment-item">
                    <strong>${c.commenter.name}:</strong> ${c.text}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
          container.appendChild(postDiv);
        });
      })
      .catch(error => console.error("Error loading JSON:", error));
  };

  // 2. GLOBAL CLICK HANDLER (Event Delegation)
  // This makes sure buttons inside the FETCHED posts actually work
  document.addEventListener('click', (e) => {
    
    // Handle "Send" icon clicks
    if (e.target.classList.contains('send-icon')) {
      const input = e.target.closest('.comment-input-wrapper').querySelector('[contenteditable]');
      const text = input.innerText.trim();
      if (text !== "" && !text.includes("Response for")) {
        alert("Response shared!");
        input.innerText = "";
      }
    }

    // Handle "View Comments" toggle
    if (e.target.classList.contains('view-comments')) {
      const id = e.target.getAttribute('data-id');
      const list = document.getElementById(`comments-${id}`);
      list.style.display = list.style.display === 'none' ? 'block' : 'none';
    }

    // Handle "Join" buttons
    if (e.target.classList.contains('join-btn')) {
      const isJoined = e.target.classList.toggle('joined');
      e.target.innerText = isJoined ? "Joined" : "Join";
      e.target.style.background = isJoined ? "#afcebb" : "#111";
    }

    // Handle Search/Filter Tabs
    if (e.target.classList.contains('tab')) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
    }
  });

  // 3. CONTENTEDITABLE PLACEHOLDER LOGIC
  // Clears text when you click inside, brings it back if empty
  document.addEventListener('focusin', (e) => {
    if (e.target.hasAttribute('contenteditable')) {
      e.target.dataset.placeholder = e.target.innerText.trim();
      if (e.target.innerText.trim() === e.target.dataset.placeholder) {
        e.target.innerText = "";
        e.target.style.opacity = "1";
      }
    }
  });

  document.addEventListener('focusout', (e) => {
    if (e.target.hasAttribute('contenteditable')) {
      if (e.target.innerText.trim() === "") {
        e.target.innerText = e.target.dataset.placeholder;
        e.target.style.opacity = "0.6";
      }
    }
  });

  // 4. SEARCH BAR LOGIC
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.post-card, .group-card').forEach(card => {
        const content = card.innerText.toLowerCase();
        card.style.display = content.includes(term) ? "block" : "none";
      });
    });
  }

  // INITIALIZE
  loadPosts();
});

