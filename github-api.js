// GitHub API 交互模块
class GitHubIntegration {
    constructor(repoOwner, repoName) {
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.apiBase = 'https://api.github.com';
    }

    // 获取仓库基本信息
    async getRepoInfo() {
        const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}`);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        return await response.json();
    }

    // 获取贡献者列表
    async getContributors() {
        const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/contributors`);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        return await response.json();
    }

    // 获取issues列表
    async getIssues(state = 'open') {
        const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/issues?state=${state}`);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        return await response.json();
    }

    // 获取README内容
    async getReadme() {
        const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/readme`);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        const data = await response.json();
        return atob(data.content); // Base64解码
    }

    // 获取最新发布版本
    async getLatestRelease() {
        const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/releases/latest`);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        return await response.json();
    }
}

// 使用示例
document.addEventListener('DOMContentLoaded', async () => {
    const github = new GitHubIntegration('TypingEnglish', 'typing-english');
    
    try {
        // 获取仓库信息并更新页面
        const repoInfo = await github.getRepoInfo();
        document.getElementById('stars-count').textContent = repoInfo.stargazers_count.toLocaleString();
        document.getElementById('forks-count').textContent = repoInfo.forks_count.toLocaleString();
        document.getElementById('watchers-count').textContent = repoInfo.watchers_count.toLocaleString();
        document.getElementById('issues-count').textContent = repoInfo.open_issues_count.toLocaleString();
        
        // 获取贡献者并显示
        const contributors = await github.getContributors();
        const contributorsContainer = document.getElementById('contributors');
        
        contributors.forEach(contributor => {
            const contributorElement = document.createElement('div');
            contributorElement.className = 'flex flex-col items-center';
            contributorElement.innerHTML = `
                <a href="${contributor.html_url}" target="_blank" class="group">
                    <img src="${contributor.avatar_url}" alt="${contributor.login}" 
                        class="w-16 h-16 rounded-full mb-2 group-hover:ring-2 group-hover:ring-primary transition-all duration-200">
                    <span class="text-sm text-gray-700 group-hover:text-primary transition-colors duration-200">${contributor.login}</span>
                </a>
            `;
            contributorsContainer.appendChild(contributorElement);
        });
        
        // 获取README内容 (可选)
        // const readme = await github.getReadme();
        // console.log(readme);
        
    } catch (error) {
        console.error('Failed to load GitHub data:', error);
        // 显示错误信息或回退内容
        document.getElementById('github-error').classList.remove('hidden');
    }
});