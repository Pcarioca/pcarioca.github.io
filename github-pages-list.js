(function(){
  /**
   * Fetches public repositories for the current user (inferred from the host)
   * via the GitHub API and populates a list of cards linking to sites
   * deployed via GitHub Pages. If no projects are found or an error
   * occurs, a friendly message will be displayed instead.
   */
  async function populateProjects() {
    const container = document.getElementById('project-list');
    if (!container) return;
    container.textContent = 'Loading projects…';
    try {
      // Extract the GitHub username from the host (e.g. pcarioca.github.io → pcarioca).
      let username = window.location.hostname.split('.')[0];
      if (!username) {
        throw new Error('Unable to determine GitHub username from host');
      }

      // Query the GitHub API for the user’s public repos.
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      const repos = await response.json();

      // Filter for repositories that have GitHub Pages enabled and skip the user/organization site itself.
      const pagesRepos = repos.filter(repo => repo.has_pages && repo.name.toLowerCase() !== `${username.toLowerCase()}.github.io`);

      if (pagesRepos.length === 0) {
        container.textContent = 'No GitHub Pages projects found.';
        return;
      }

      // Clear loading message and build cards for each project.
      container.innerHTML = '';
      pagesRepos.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'card';
        const link = document.createElement('a');
        link.href = `https://${username}.github.io/${repo.name}/`;
        link.textContent = repo.name;
        link.target = '_blank';
        const desc = document.createElement('p');
        desc.textContent = repo.description || '';
        card.append(link, desc);
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Error populating GitHub Pages projects:', error);
      container.textContent = 'An error occurred while loading projects.';
    }
  }

  // Run on DOMContentLoaded to ensure the DOM is ready.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateProjects);
  } else {
    populateProjects();
  }
})();
