export const mockComments = Array.from({ length: 50 }, (_, i) => {
  const videoId = (Math.floor(Math.random() * 4) + 1).toString();
  const randomUserId = `user_${i + 1}`;
  const usernames = ["sunny_dev", "alice123", "coderjoe", "techie22", "nomadguy", "janedoe", "pixie_dust"];
  const names = ["Sunny", "Alice", "Joe", "Rita", "Karan", "Jane", "Pixie"];
  const randomIndex = Math.floor(Math.random() * usernames.length);

  return {
    _id: `comment_${i + 1}`,
    content: `This is a mock comment #${i + 1}`,
    videoId: videoId,
    repliesCount: Math.floor(Math.random() * 10),
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString(),
    donations: Math.floor(Math.random() * 100),
    upvotes: Math.floor(Math.random() * 200),
    downvotes: Math.floor(Math.random() * 50),
    user: {
      id: randomUserId,
      name: names[randomIndex],
      username: usernames[randomIndex],
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${usernames[randomIndex]}`
    },
    upvoted: Math.random() > 0.7,
    downvoted: Math.random() > 0.8,
    replies: Math.floor(Math.random() * 50)
  };
});