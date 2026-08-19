// Which community "space" a post belongs to - distinct from `tag` (topic
// labels like AI Engineering / Data Science). GENERAL is both the default
// and what the main Feed page shows unfiltered (all channels mixed); the
// other values back their own dedicated space page. Announcements and Ask
// for Help are NOT here - those are separate models/features entirely.
export var FeedChannel;
(function (FeedChannel) {
    FeedChannel["GENERAL"] = "general";
    FeedChannel["INTRODUCTIONS"] = "introductions";
    FeedChannel["GENERAL_DISCUSSION"] = "general-discussion";
})(FeedChannel || (FeedChannel = {}));
export var FeedType;
(function (FeedType) {
    FeedType["FEED"] = "feed";
    FeedType["WORKSHOP"] = "workshop";
})(FeedType || (FeedType = {}));
// Fixed set of topic labels a post can be tagged with - a plain enum field
// on Feed (see FeedChannel above for the same pattern), not a referenced
// document, since there's no such thing as a user-defined topic here.
export var FeedTag;
(function (FeedTag) {
    FeedTag["CYBER_SECURITY"] = "cyber-security";
    FeedTag["AI_ENGINEERING"] = "ai-engineering";
    FeedTag["DATA_SCIENCE"] = "data-science";
})(FeedTag || (FeedTag = {}));
