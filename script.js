// DOM elements
const errorMessage = document.getElementById('error-message');
const repoContainer = document.getElementById('repo-container');
// Hardcoded username
const GITHUB_USERNAME = 'jcrabapple';
const profileName = document.getElementById('profile-name');
const profileBio = document.getElementById('profile-bio');
const repoCount = document.getElementById('repo-count');
const followerCount = document.getElementById('follower-count');
const followingCount = document.getElementById('following-count');
const profileImage = document.querySelector('.profile-image');
const githubLink = document.getElementById('github-link');
const emailLink = document.getElementById('email-link');
const emailText = document.getElementById('email-text');
const blogLink = document.getElementById('blog-link');
const twitterLink = document.getElementById('twitter-link');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const languageTags = document.getElementById('language-tags');
const usernameSection = document.querySelector('.username-section');
const repoTemplate = document.getElementById('repo-template');

// State management
let allRepos = [];
let filteredRepos = [];
let languageFilters = new Set();
let activeLanguageFilter = null;

// Language colors mapping (for common languages)
const languageColors = {
    "JavaScript": "#f1e05a",
    "Python": "#3572A5",
    "Java": "#b07219",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "TypeScript": "#3178c6",
    "PHP": "#4F5D95",
    "Ruby": "#701516",
    "C#": "#178600",
    "C++": "#f34b7d",
    "C": "#555555",
    "Go": "#00ADD8",
    "Rust": "#dea584",
    "Swift": "#ffac45",
    "Kotlin": "#A97BFF",
    "Dart": "#00B4AB",
    "Shell": "#89e051",
    "Jupyter Notebook": "#DA5B0B",
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    searchInput.addEventListener('input', filterRepos);
    sortSelect.addEventListener('change', sortRepos);
    
    // Load data automatically
    loadUserData();
});

// Load user and repository data
async function loadUserData() {
    showLoading(true);
    hideError();
    
    try {
        // Fetch user profile data
        const userData = await fetchUserData(GITHUB_USERNAME);
        if (!userData) return;
        
        // Fetch repositories data
        const reposData = await fetchRepositories(GITHUB_USERNAME);
        if (!reposData) return;
        
        // Update UI with fetched data
        updateProfileUI(userData);
        processRepositories(reposData);
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Error loading GitHub data. Please refresh the page to try again.');
        showLoading(false);
    }
}

// Fetch user profile data from GitHub API
async function fetchUserData(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                showError(`User "${username}" not found`);
                return null;
            }
            
            if (response.status === 403) {
                showError('API rate limit exceeded. Please try again later.');
                return null;
            }
            
            showError('Error fetching user data');
            return null;
        }
        
        return await response.json();
    } catch (error) {
        showError('Network error. Please check your connection.');
        console.error('Fetch error:', error);
        return null;
    }
}

// Fetch repositories data from GitHub API
async function fetchRepositories(username) {
    try {
        // Fetch up to 100 repositories (GitHub API limit per page)
        const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
        
        if (!response.ok) {
            if (response.status === 403) {
                showError('API rate limit exceeded. Please try again later.');
                return null;
            }
            
            showError('Error fetching repositories');
            return null;
        }
        
        return await response.json();
    } catch (error) {
        showError('Network error. Please check your connection.');
        console.error('Fetch error:', error);
        return null;
    }
}

// Update the profile section UI with user data
function updateProfileUI(userData) {
    profileName.textContent = userData.name || userData.login;
    profileBio.textContent = userData.bio || 'No bio available';
    repoCount.textContent = userData.public_repos;
    followerCount.textContent = userData.followers;
    followingCount.textContent = userData.following;
    
    // Update profile image
    profileImage.innerHTML = `<img src="${userData.avatar_url}" alt="${userData.login}'s profile picture">`;
    
    // Update profile links
    githubLink.href = userData.html_url;
    
    // Email (if public)
    if (userData.email) {
        emailLink.href = `mailto:${userData.email}`;
        emailText.textContent = userData.email;
        emailLink.classList.remove('hidden');
    } else {
        emailLink.classList.add('hidden');
    }
    
    // Blog/website (if available)
    if (userData.blog) {
        let blogUrl = userData.blog;
        // Add https:// if missing
        if (!/^https?:\/\//i.test(blogUrl)) {
            blogUrl = 'https://' + blogUrl;
        }
        blogLink.href = blogUrl;
        blogLink.classList.remove('hidden');
    } else {
        blogLink.classList.add('hidden');
    }
    
    // Twitter (if available)
    if (userData.twitter_username) {
        twitterLink.href = `https://twitter.com/${userData.twitter_username}`;
        twitterLink.classList.remove('hidden');
    } else {
        twitterLink.classList.add('hidden');
    }
}

// Process repository data and populate UI
function processRepositories(repos) {
    // Store all repos and reset state
    allRepos = repos;
    filteredRepos = [...repos];
    languageFilters = new Set();
    activeLanguageFilter = null;
    
    // If no repositories, show message
    if (repos.length === 0) {
        repoContainer.innerHTML = '<p>No repositories found.</p>';
        return;
    }
    
    // Collect unique languages for filters
    const languages = new Map();
    
    repos.forEach(repo => {
        if (repo.language) {
            if (languages.has(repo.language)) {
                languages.set(repo.language, languages.get(repo.language) + 1);
            } else {
                languages.set(repo.language, 1);
            }
        }
    });
    
    // Create language filter tags (sorted by count, descending)
    languageTags.innerHTML = '';
    [...languages.entries()]
        .sort((a, b) => b[1] - a[1])
        .forEach(([language, count]) => {
            const tag = document.createElement('div');
            tag.className = 'language-tag';
            
            // Get language color or default
            const color = languageColors[language] || '#999999';
            
            tag.innerHTML = `
                <span class="language-color" style="background-color: ${color}"></span>
                <span>${language}</span>
                <span>(${count})</span>
            `;
            
            tag.addEventListener('click', () => {
                toggleLanguageFilter(language);
            });
            
            languageTags.appendChild(tag);
            languageFilters.add(language);
        });
    
    // Sort and display repos
    sortRepos();
}

// Filter repositories based on search input and language selection
function filterRepos() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    filteredRepos = allRepos.filter(repo => {
        // Filter by language if active
        if (activeLanguageFilter && repo.language !== activeLanguageFilter) {
            return false;
        }
        
        // Filter by search term
        if (searchTerm) {
            const nameMatch = repo.name.toLowerCase().includes(searchTerm);
            const descMatch = repo.description && repo.description.toLowerCase().includes(searchTerm);
            const topicsMatch = repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(searchTerm));
            
            return nameMatch || descMatch || topicsMatch;
        }
        
        return true;
    });
    
    sortRepos();
}

// Toggle language filter selection
function toggleLanguageFilter(language) {
    // Clear current active filter
    document.querySelectorAll('.language-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    // If selecting the same language, clear filter
    if (activeLanguageFilter === language) {
        activeLanguageFilter = null;
    } else {
        // Set new active filter
        activeLanguageFilter = language;
        
        // Highlight the selected language tag
        document.querySelectorAll('.language-tag').forEach(tag => {
            if (tag.textContent.includes(language)) {
                tag.classList.add('active');
            }
        });
    }
    
    filterRepos();
}

// Sort repositories based on selected criteria
function sortRepos() {
    const sortBy = sortSelect.value;
    
    switch (sortBy) {
        case 'updated':
            filteredRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            break;
        case 'stars':
            filteredRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            break;
        case 'name':
            filteredRepos.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'created':
            filteredRepos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
    }
    
    displayRepos(filteredRepos);
}

// Display repositories in the UI
function displayRepos(repos) {
    repoContainer.innerHTML = '';
    
    if (repos.length === 0) {
        repoContainer.innerHTML = '<p>No repositories match your criteria.</p>';
        return;
    }
    
    repos.forEach(repo => {
        // Clone the template
        const repoCard = repoTemplate.content.cloneNode(true);
        
        // Set repository name with link
        const repoName = repoCard.querySelector('.repo-name');
        repoName.textContent = repo.name;
        
        // Set description (if available)
        const repoDescription = repoCard.querySelector('.repo-description');
        repoDescription.textContent = repo.description || 'No description provided';
        
        // Set language (if available)
        const repoLanguage = repoCard.querySelector('.repo-language');
        const languageColor = repoCard.querySelector('.language-color');
        const languageName = repoCard.querySelector('.language-name');
        
        if (repo.language) {
            const color = languageColors[repo.language] || '#999999';
            languageColor.style.backgroundColor = color;
            languageName.textContent = repo.language;
        } else {
            repoLanguage.classList.add('hidden');
        }
        
        // Set stars count
        repoCard.querySelector('.stars-count').textContent = repo.stargazers_count;
        
        // Set forks count
        repoCard.querySelector('.forks-count').textContent = repo.forks_count;
        
        // Set last updated date
        const updatedDate = repoCard.querySelector('.updated-date');
        updatedDate.textContent = formatDate(repo.updated_at);
        updatedDate.title = new Date(repo.updated_at).toLocaleString();
        
        // Set repository links
        const repoLink = repoCard.querySelector('.repo-link');
        repoLink.href = repo.html_url;
        
        // Set homepage/demo link if available
        const homepageLink = repoCard.querySelector('.homepage-link');
        if (repo.homepage) {
            homepageLink.href = repo.homepage;
            homepageLink.classList.remove('hidden');
        }
        
        // Set topics
        const topicsContainer = repoCard.querySelector('.repo-topics');
        if (repo.topics && repo.topics.length > 0) {
            repo.topics.slice(0, 5).forEach(topic => {
                const topicElement = document.createElement('span');
                topicElement.className = 'repo-topic';
                topicElement.textContent = topic;
                topicsContainer.appendChild(topicElement);
            });
        }
        
        // Add the card to the container
        repoContainer.appendChild(repoCard);
    });
}

// Format date to relative time (e.g., "2 days ago")
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        }
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    }
    
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

// Show/hide loading spinner
function showLoading(isLoading) {
    const spinner = document.querySelector('.loading-spinner');
    if (isLoading) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

// Display error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// The data will now load automatically when the page loads
// No need for URL parameters or local storage since the username is hardcoded