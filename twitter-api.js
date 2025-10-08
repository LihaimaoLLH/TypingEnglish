// Twitter API 交互模块
class TwitterIntegration {
    constructor(username) {
        this.username = username;
        // 注意: 实际应用中这些应该从安全的后端获取
        this.bearerToken = 'YOUR_TWITTER_BEARER_TOKEN';
        this.apiBase = 'https://api.twitter.com/2';
    }

    // 获取用户信息
    async getUserInfo() {
        const response = await fetch(`${this.apiBase}/users/by/username/${this.username}?user.fields=profile_image_url,description`, {
            headers: {
                'Authorization': `Bearer ${this.bearerToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Twitter API error: ${response.status}`);
        }
        
        return await response.json();
    }

    // 获取用户推文
    async getUserTweets(maxResults = 5) {
        // 首先获取用户ID
        const userInfo = await this.getUserInfo();
        const userId = userInfo.data.id;
        
        const response = await fetch(
            `${this.apiBase}/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=public_metrics,created_at&expansions=author_id&user.fields=profile_image_url`, 
            {
                headers: {
                    'Authorization': `Bearer ${this.bearerToken}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Twitter API error: ${response.status}`);
        }
        
        return await response.json();
    }

    // 获取带有特定标签的推文
    async getTweetsByHashtag(hashtag, maxResults = 5) {
        const response = await fetch(
            `${this.apiBase}/tweets/search/recent?query=%23${hashtag}&max_results=${maxResults}&tweet.fields=public_metrics,created_at&expansions=author_id&user.fields=profile_image_url`, 
            {
                headers: {
                    'Authorization': `Bearer ${this.bearerToken}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Twitter API error: ${response.status}`);
        }
        
        return await response.json();
    }

    // 格式化API返回的推文数据
    formatTweets(apiResponse) {
        if (!apiResponse.data) return [];
        
        const users = apiResponse.includes?.users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
        
        return apiResponse.data.map(tweet => {
            const user = users[tweet.author_id];
            return {
                id: tweet.id,
                text: tweet.text,
                created_at: tweet.created_at,
                likes: tweet.public_metrics?.like_count || 0,
                retweets: tweet.public_metrics?.retweet_count || 0,
                replies: tweet.public_metrics?.reply_count || 0,
                user: {
                    name: user?.name || 'Unknown',
                    screen_name: user?.username || 'unknown',
                    profile_image_url: user?.profile_image_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'
                }
            };
        });
    }
}

// 使用示例
document.addEventListener('DOMContentLoaded', async () => {
    const twitter = new TwitterIntegration('TypingEnglish');
    
    try {
        // 获取用户信息
        const userInfo = await twitter.getUserInfo();
        console.log('Twitter User Info:', userInfo);
        
        // 获取并显示官方推文
        const tweetsResponse = await twitter.getUserTweets(3);
        const formattedTweets = twitter.formatTweets(tweetsResponse);
        
        const tweetsContainer = document.getElementById('tweets-container');
        tweetsContainer.innerHTML = formattedTweets.map(tweet => renderTweet(tweet)).join('');
        
        // 获取并显示社区推文
        const communityTweetsResponse = await twitter.getTweetsByHashtag('TypingEnglish', 2);
        const formattedCommunityTweets = twitter.formatTweets(communityTweetsResponse);
        
        const communityTweetsContainer = document.getElementById('community-tweets');
        communityTweetsContainer.innerHTML = formattedCommunityTweets.map(tweet => renderTweet(tweet)).join('');
        
    } catch (error) {
        console.error('Failed to load Twitter data:', error);
        // 显示错误信息或使用模拟数据
        document.getElementById('tweets-container').innerHTML = `
            <div class="tweet-card text-center py-8 text-gray-500">
                <p>无法加载推文。请稍后再试或<a href="https://twitter.com/TypingEnglish" target="_blank" class="text-blue-500 hover:underline">直接访问我们的Twitter页面</a>。</p>
            </div>
        `;
    }
});

// 渲染推文函数
function renderTweet(tweet) {
    return `
        <div class="tweet-card" data-tweet-id="${tweet.id}">
            <div class="flex items-start space-x-3">
                <img src="${tweet.user.profile_image_url}" alt="${tweet.user.name}" 
                    class="w-12 h-12 rounded-full">
                <div class="flex-1">
                    <div class="flex items-center space-x-1">
                        <span class="font-bold">${tweet.user.name}</span>
                        <span class="text-gray-500">@${tweet.user.screen_name}</span>
                        <span class="text-gray-500">·</span>
                        <span class="text-gray-500">${formatTweetDate(tweet.created_at)}</span>
                    </div>
                    <p class="mt-1 mb-3">${tweet.text}</p>
                    <div class="flex space-x-4 text-gray-500">
                        <span class="flex items-center space-x-1">
                            <i class="fa fa-comment"></i>
                            <span>${tweet.replies}</span>
                        </span>
                        <span class="flex items-center space-x-1">
                            <i class="fa fa-retweet"></i>
                            <span>${tweet.retweets}</span>
                        </span>
                        <span class="flex items-center space-x-1">
                            <i class="fa fa-heart"></i>
                            <span>${tweet.likes}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}