 export const mockReplies = Array.from({ length: 100 }, (_, i) => {
  const randomUserId = `user_${i + 1}`;
  const usernames = ["sunny_dev", "alice123", "coderjoe", "techie22", "nomadguy", "janedoe", "pixie_dust"];
  const names = ["Sunny", "Alice", "Joe", "Rita", "Karan", "Jane", "Pixie"];
  const randomIndex = Math.floor(Math.random() * usernames.length);

  return {
    _id: `reply_${i + 1}`,
    content: `This is a mock reply #${i + 1}`,
    parentId: `comment_${Math.floor(Math.random() * 50) + 1}`, // Matches with your mockComments
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString(),
    donations: Math.floor(Math.random() * 50),
    upvotes: Math.floor(Math.random() * 100),
    downvotes: Math.floor(Math.random() * 30),
    user: {
      id: randomUserId,
      name: names[randomIndex],
      username: usernames[randomIndex],
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${usernames[randomIndex]}`,
    },
    upvoted: Math.random() > 0.7,
    downvoted: Math.random() > 0.8,
  };
});