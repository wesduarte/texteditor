import '/imports/api/documents.js';
import '/imports/api/editingusers.js';
import '/imports/api/comments.js';
import '/imports/startup/accounts.js';
import '/shared/methods.js';

Meteor.subscribe("documents");
Meteor.subscribe("editingUsers");
Meteor.subscribe("comments");

Router.configure({
  layoutTemplate:"ApplicationLayout"
});

Router.route('/', function () {
  this.render("navbar", {to:"header"});
  this.render("docList", {to:"main"});
});

Router.route('/documents/:_id', function () {
  this.render("navbar", {to:"header"});
  this.render("docItem", {to:"main"});
});

Template.editor.helpers({
  docid:function(){
    setUpCurrentDocument()
    return Session.get("docid");
  },
  config:function(){
    return function(editor){
      editor.setOption("mode", "html");
      editor.setOption("theme", "cobalt");
      editor.on("change", function(cm_editor, info){
        $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
        Meteor.call("addEditingUser", Session.get("docid"));
      });
    }
  },
});

Template.editingUsers.helpers({
  users:function(docid){
    var doc, eUsers, users;
    doc = Documents.findOne({_id:Session.get("docid")});
    if(!doc){return;}
    eUsers = EditingUsers.findOne({doc_id:doc._id});
    if(!eUsers){console.log("eUsers");return;}
    users = [];
    var i = 0;
    for(var user_id in eUsers.users){
      var user = fixObjectKeys(eUsers.users[user_id]);
      users[i] = user;
      i++;
    }
    console.log(users);

    return users;
  }
});

Template.insertCommentForm.helpers({
  docid:function(){
    setUpCurrentDocument()
    return Session.get("docid");
  },
  userid:function(){
    if(Meteor.user())
      return Meteor.user()._id;
    return;
  }
});

Template.commentList.helpers({
  comments:function() {
    return Comments.find({});
    //return Comments.find({docid:Session.get("docid")});
  }
});

Template.docMeta.helpers({
  document:function(){
    return Documents.findOne({_id:Session.get("docid")});
  },
  canEdit:function(){
    var doc = Documents.findOne({_id:Session.get("docid")});
    if(doc){
      if(doc.owner == Meteor.userId()){
        return true;
      }
    }
    return false;
  }
});

Template.navbar.helpers({
  documents:function(){
    return Documents.find();
  }
});

Template.docList.helpers({
  documents:function(){
    return Documents.find();
  }
});

Template.docMeta.events({
  'click .js-tog-private':function(event){
    var doc = {_id:Session.get("docid"), isPrivate: event.target.checked };
    console.log("Changing privacy");
    console.log(doc);
    Meteor.call("updateDocPrivacy", doc);
  }
});

Template.navbar.events({
  'click .js-add-doc':function(){
    event.preventDefault();
    console.log("Add a new doc");

    if(!Meteor.user()){
      alert("You need to log-in!");
    } else {
    Meteor.call("addDoc", function(err, res){
        if(!err){
          console.log("Doc created with id " + res);
          Session.set("docid", res);
        }
      });
    }
  },
  'click .js-load-doc':function(event){
    Session.set("docid", this._id);
  }
});

function setUpCurrentDocument(){
  var doc;
  if(!Session.get("docid")){
    doc = Documents.findOne();
    if(doc){
      Session.set("docid", doc._id);
    }
  }
}

function fixObjectKeys(obj){
  var newObj = {}
  for(key in obj){
    var key2 = key.replace("-", "");
    newObj[key2] = obj[key];
  }
  return newObj;
}
