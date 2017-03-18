this.Comments = new Mongo.Collection("comments");
Comments.attachSchema(new SimpleSchema({
  title: {
    type: "string",
    label: "title",
    max: 200
  },
  body: {
    type: "string",
    label: "comment",
    max: 1000
  },
  docid: {
    type: "string",
  }
}));
