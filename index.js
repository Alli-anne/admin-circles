document.addEventListener('DOMContentLoaded', () => {
    // 1. FETCH AND RENDER POSTS
    const loadPosts = () => {
        fetch("comments.json")
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById("postsContainer");
                if (!container) return;

                container.innerHTML = ''; // Clear container

                data.posts.forEach((post, index) => {
                    const postDiv = document.createElement("div");
                    postDiv.classList.add("post-card");

                    // Map through tags to create the HTML pills
                    const tagsHTML = post.tags ? post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : '';

                    // Create the HTML for existing comments (hidden by default)
                    const commentsHTML = post.comments.map(c => `
                        <div class="comment-item">
                            <strong>${c.commenter.name} (${c.commenter.role}):</strong>
                            <p>${c.text}</p>
                        </div>
                    `).join('');

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

                        <div class="post-tags">
                            ${tagsHTML}
                        </div>

                        <div class="post-footer">
                            <div class="comment-input-wrapper">
                                <div class="comment-placeholder" contenteditable="true">${post.response.text}</div>
                                <img src="css/images/send.svg" class="send-icon" alt="Send">
                            </div>
                            <button class="view-comments" data-post-id="${index}">
                                View ${post.comments.length} Comments
                            </button>
                            <div class="comments-section" id="comments-${index}" style="display: none;">
                                ${commentsHTML}
                            </div>
                        </div>
                    `;
                    container.appendChild(postDiv);
                });

                setupEditablePlaceholders();
            })
            .catch(err => console.error("Error loading posts:", err));
    };

    // 2. PLACEHOLDER LOGIC
    const setupEditablePlaceholders = () => {
        const editables = document.querySelectorAll('[contenteditable="true"]');
        editables.forEach(el => {
            if (el.dataset.hasPlaceholder) return;
            el.dataset.hasPlaceholder = "true";

            // Store the initial text as the placeholder
            const defaultText = el.innerText.trim();

            el.addEventListener('focus', () => {
                if (el.innerText.trim() === defaultText) {
                    el.innerText = '';
                    el.style.opacity = '1';
                }
            });

            el.addEventListener('blur', () => {
                if (el.innerText.trim() === '') {
                    el.innerText = defaultText;
                    el.style.opacity = '0.6';
                }
            });
        });
    };

    // 3. GLOBAL CLICK HANDLER (Event Delegation)
    document.addEventListener('click', (e) => {
        
        // Toggle Comments visibility
        if (e.target.classList.contains('view-comments')) {
            const postId = e.target.getAttribute('data-post-id');
            const section = document.getElementById(`comments-${postId}`);
            const isHidden = section.style.display === 'none';
            section.style.display = isHidden ? 'block' : 'none';
            e.target.innerText = isHidden ? 'Hide Comments' : e.target.innerText.replace('Hide', 'View');
        }

        // Join Button Toggle
        if (e.target.classList.contains('join-btn')) {
            const btn = e.target;
            const isJoined = btn.classList.toggle('joined');
            btn.innerText = isJoined ? "Joined" : "Join";
            btn.style.background = isJoined ? "#afcebb" : "#111";
        }

        // Send Comment
        if (e.target.classList.contains('send-icon')) {
            const wrapper = e.target.closest('.comment-input-wrapper');
            const input = wrapper.querySelector('[contenteditable="true"]');
            if (input.innerText.trim() !== "") {
                alert("Response shared!");
                input.innerText = "";
            }
        }
    });

    // 4. IMPROVED SEARCH (Checks Body AND Tags)
    const setupSearch = () => {
        const searchInput = document.querySelector('.search-bar input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.post-card');

            cards.forEach(card => {
                const bodyText = card.querySelector('.post-body').innerText.toLowerCase();
                const tagsText = card.querySelector('.post-tags').innerText.toLowerCase();
                
                if (bodyText.includes(term) || tagsText.includes(term)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    };

    loadPosts();
    setupSearch();
});