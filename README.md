# GitHub Portfolio

A responsive and dynamic portfolio website that showcases your GitHub repositories using the GitHub API.

## Features

- Dynamic fetching of GitHub profile information
- Displays all your repositories with detailed information
- Filter repositories by language or search term
- Sort repositories by various criteria (recently updated, stars, name, creation date)
- Responsive design for all devices
- Dark theme support (matches system preferences)
- Local storage for remembering your username

## How to Deploy on GitHub Pages

1. Create a new repository on GitHub named `username.github.io` (replace `username` with your GitHub username)
2. Clone this repository to your local machine
3. Copy all the files from this project to your new repository
4. Push the files to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

5. Go to your repository's settings on GitHub
6. Scroll down to the "GitHub Pages" section
7. Select the "main" branch as the source
8. Wait a few minutes for the site to be published
9. Your portfolio is now live at `https://username.github.io`!

## Customization

### Colors

You can customize the color scheme by modifying the CSS variables in the `:root` selector in `styles.css`:

```css
:root {
    --primary-color: #0366d6;
    --secondary-color: #24292e;
    --background-color: #f6f8fa;
    /* ...other variables */
}
```

### Adding Custom Sections

You can add additional sections to your portfolio by modifying the HTML and CSS. For example, to add a "Skills" section:

1. Add the HTML structure in `index.html`:

```html
<section class="skills-section">
    <div class="container">
        <h2>Skills</h2>
        <div class="skills-grid">
            <!-- Add your skills here -->
        </div>
    </div>
</section>
```

2. Add the corresponding CSS in `styles.css`
3. Add JavaScript functionality if needed

## Limitations

- The GitHub API has rate limits: 60 requests per hour for unauthenticated requests
- Only the first 100 repositories are displayed (GitHub API limitation per page)
- To fetch more repositories or increase rate limits, you would need to implement OAuth authentication

## Future Improvements

Ideas for future enhancements:

- Add GitHub OAuth authentication to increase API rate limits
- Add pagination for users with more than 100 repositories
- Add more detailed statistics and visualizations
- Add a project showcase section for featured repositories
- Implement theme toggle (light/dark mode)

## License

This project is available under the MIT License.

---

Created by jcrabapple
