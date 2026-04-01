fetch("comments.json")
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById("postsContainer");

    data.posts.forEach(post => {
      // MAIN POST WRAPPER
      const postDiv = document.createElement("div");
      postDiv.classList.add("post", "post_content");

      // ================= HEADER =================
      const header = document.createElement("div");
      header.classList.add("post", "header");

      header.innerHTML = `
        <div class="post add profile">
          <img class="profile_picture post" src="${post.header.profile_picture}" alt="profile_picture">
          <h3 class="post author">${post.header.author}</h3>
        </div>

        <div class="post info">
          <h4 class="post role">${post.header.role}</h4>
          <h4 class="post place">${post.header.place}</h4>
        </div>

        <div class="post group_2">
          <h4 class="post group_2">${post.header.group || "Group Name"}</h4>
          <h4 class="post time">${post.header.time}</h4>
        </div>
      `;

      // ================= CONTENT =================
      const content = document.createElement("div");
      content.classList.add("post", "content");

      const innerContent = document.createElement("div");

      innerContent.innerHTML = `
        <div class="post user_content">
          <p class="post body">${post.content.body}</p>
        </div>

        <div class="post responce">
          <p class="post responceText editable-text" contenteditable="true">
            ${post.response.text}
          </p>
          <img class="post send" src="css/images/send.svg" alt="send">
        </div>
      `;

      // ================= COMMENTS =================
      const commentsDiv = document.createElement("div");
      commentsDiv.classList.add("post", "comments");

      commentsDiv.innerHTML = `<h4>Comments (${post.comments.length})</h4>`;

      const showComments = document.createElement("div");
      showComments.classList.add("post", "showComments");

      post.comments.forEach(comment => {
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("post", "theComment");

        commentDiv.innerHTML = `
          <h4>${comment.text}</h4>
          <div class="post theCommenter">
            <h5 class="post theCommenterName">${comment.commenter.name}</h5>
            <h5 class="post theCommenterRole">${comment.commenter.role}</h5>
          </div>
        `;

        showComments.appendChild(commentDiv);
      });

      commentsDiv.appendChild(showComments);

      // ================= ASSEMBLE =================
      innerContent.appendChild(commentsDiv);
      content.appendChild(innerContent);

      postDiv.appendChild(header);
      postDiv.appendChild(content);

      container.appendChild(postDiv);
    });
  })
  .catch(error => console.error("Error loading JSON:", error));
const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

