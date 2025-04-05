import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
} from "../posts";

// Mock fetch
global.fetch = jest.fn();

describe("Posts API", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe("fetchPosts", () => {
    it("should fetch posts successfully", async () => {
      const mockPosts = {
        suggestions: [
          {
            id: "1",
            content: "テスト投稿",
            timestamp: "2024-04-05T00:00:00Z",
            likes: 0,
            category: "提案",
          },
        ],
        hasMore: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      });

      const posts = await fetchPosts();
      expect(posts).toEqual(mockPosts);
      expect(global.fetch).toHaveBeenCalledWith("/api/posts");
    });

    it("should fetch posts with limit and offset", async () => {
      const mockPosts = {
        suggestions: [
          {
            id: "1",
            content: "テスト投稿",
            timestamp: "2024-04-05T00:00:00Z",
            likes: 0,
            category: "提案",
          },
        ],
        hasMore: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      });

      const posts = await fetchPosts(10, 20);
      expect(posts).toEqual(mockPosts);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/posts?limit=10&offset=20"
      );
    });

    it("should throw an error when fetch fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchPosts()).rejects.toThrow("投稿の取得に失敗しました");
    });
  });

  describe("createPost", () => {
    it("should create a post successfully", async () => {
      const newPost = {
        content: "新しい投稿",
        category: "提案",
      };

      const mockResponse = {
        id: "1",
        ...newPost,
        timestamp: "2024-04-05T00:00:00Z",
        likes: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const post = await createPost(newPost);
      expect(post).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });
    });
  });
});
