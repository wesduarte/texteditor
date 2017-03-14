this.Documents = new Mongo.Collection("documents");
this.EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {

// find the first document in the Documents colleciton and send back its id
  Template.editor.helpers({
    docid:function(){
      setUpCurrentDocument()
      return Session.get("docid");
    },
    // template helper that configures the CodeMirror editor
    // you might also want to experiment with the ACE editor
    config:function(){
      return function(editor){
        editor.setOption("mode", "html");
        editor.setOption("theme", "cobalt");
        editor.on("change", function(cm_editor, info){
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
          Meteor.call("addEditingUser");
        });
      }
    },
  });

  Template.editingUsers.helpers({
    users:function(){
      var doc, eUsers, users;
      doc = Documents.findOne();
      if(!doc){console.log("no doc");return;}

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

  Template.docMeta.helpers({
    document:function(){
      return Documents.findOne({_id:Session.get("docid")});
    }
  });

  Template.navbar.helpers({
    documents:function(){
      return Documents.find();
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
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // startup code that creates a document in case there isn't one yet.
    if (!Documents.findOne()){// no documents yet!
        Documents.insert({title:"my new document"});
    }
  });

  Meteor.methods({
    addDoc:function(){
      var doc;

      if(!this.userId){
        return;
      }

      user_id = this.userId;

      doc = {
        owner:user_id,
        createdOn: new Date(),
        title:"My new doc"
      }

      return Documents.insert(doc);
    },
    addEditingUser:function(){
      var doc, doc_id, user, user_id, eUsers;
      doc = Documents.findOne();
      console.log("Reading doc = " + doc);
      if(!doc){
        console("There is no doc");
        return;
      }

      doc_id = doc._id;

      user = Meteor.user();
      console.log("Reading user = " + doc);


      if(!user){
        console.log("There is no user_id");
        return;
      }

      user_id = user._id;

      eUsers = EditingUsers.findOne({doc_id:doc_id});

      if(!eUsers){
        console.log("Creating new editingUsers object");
        eUsers = {
          doc_id: doc_id,
          users: {},
        };
      }

      user_profile = Meteor.user().profile;
      user.lastEdit = new Date();
      eUsers.users[user_id] = user_profile;
      EditingUsers.upsert({_id:eUsers._id}, eUsers);
      console.log("Inserted");
    }
  })
}

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
