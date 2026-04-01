document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------
    // 1. FETCH AND RENDER POSTS
    // -------------------------------
    const loadPosts = async () => {
        try {
            const response = await fetch('comments.json');
            const data = await response.json();
            renderPosts(data.posts);
        } catch (err) {
            console.error('Error loading posts:', err);
        }
    };

    const renderPosts = (posts) => {
        const container = document.getElementById('postsContainer');
        if (!container) return;

        container.innerHTML = ''; // clear previous posts

        posts.forEach((post, index) => {
            const postDiv = document.createElement('div');
            postDiv.classList.add('post-card');

            const tagsHTML = post.tags?.map(tag => `<span class="tag">#${tag}</span>`).join('') || '';
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
                    <div class="comments-section" id="comments-${index}" style="display:none;">
                        ${commentsHTML}
                    </div>
                </div>
            `;

            container.appendChild(postDiv);
        });

        setupEditablePlaceholders();
    };

    // -------------------------------
    // 2. PLACEHOLDER LOGIC
    // -------------------------------
    const setupEditablePlaceholders = () => {
        document.querySelectorAll('[contenteditable="true"]').forEach(el => {
            if (el.dataset.hasPlaceholder) return;
            el.dataset.hasPlaceholder = 'true';

            const defaultText = el.innerText.trim();
            el.style.opacity = '0.6';

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

    // -------------------------------
    // 3. GLOBAL CLICK HANDLER
    // -------------------------------
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Toggle comments
        if (target.classList.contains('view-comments')) {
            const postId = target.dataset.postId;
            const section = document.getElementById(`comments-${postId}`);
            const isHidden = section.style.display === 'none';
            section.style.display = isHidden ? 'block' : 'none';
            target.innerText = isHidden ? 'Hide Comments' : target.innerText.replace('Hide', 'View');
        }

        // Join button
        if (target.classList.contains('join-btn')) {
            const isJoined = target.classList.toggle('joined');
            target.innerText = isJoined ? 'Joined' : 'Join';
            target.style.background = isJoined ? '#afcebb' : '#111';
        }

        // Send comment
        if (target.classList.contains('send-icon')) {
            const wrapper = target.closest('.comment-input-wrapper');
            const input = wrapper.querySelector('[contenteditable="true"]');
            if (input.innerText.trim() !== '') {
                alert('Response shared!');
                input.innerText = '';
            }
        }
    });

    // -------------------------------
    // 4. SEARCH FUNCTIONALITY
    // -------------------------------
    const setupSearch = () => {
        const searchInput = document.querySelector('.search-bar input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.post-card').forEach(card => {
                const bodyText = card.querySelector('.post-body').innerText.toLowerCase();
                const tagsText = card.querySelector('.post-tags').innerText.toLowerCase();
                card.style.display = bodyText.includes(term) || tagsText.includes(term) ? 'block' : 'none';
            });
        });
    };

    // -------------------------------
    // INITIALIZE
    // -------------------------------
    loadPosts();
    setupSearch();
});