this.Comments = new Mongo.Collection("comments");
Comments.attachSchema(new SimpleSchema({
  title : {
    type : String,
    label : "title",
    max : 200
  },
  body : {
    type : String,
    label : "comment",
    max : 1000
  },
  docid : {
    type : String,
  },
  owner : {
    type : String,
  }
}));
