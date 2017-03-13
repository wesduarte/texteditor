this.Documents = new Mongo.Collection("documents");
this.EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {

  Accounts.ui.config({
    extraSignupFields: [{
        fieldName: 'first-name',
        fieldLabel: 'First name',
        inputType: 'text',
        visible: true,
        validate: function(value, errorFunction) {
          if (!value) {
            errorFunction("Please write your first name");
            return false;
          } else {
            return true;
          }
        }
      },
      {
        fieldName: 'last-name',
        fieldLabel: 'Last name',
        inputType: 'text',
        visible: true,
      },
    ],
	  requestPermissions: {
	    facebook: ['user_likes'],
	    github: ['user', 'repo']
	  },
	  requestOfflineToken: {
	    google: true
	  },
	  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
	});

// find the first document in the Documents colleciton and send back its id
  Template.editor.helpers({
    docid:function(){
      var doc = Documents.findOne();
      if (doc){
        return doc._id;
      }
      else {
        return undefined;
      }
    },
    // template helper that configures the CodeMirror editor
    // you might also want to experiment with the ACE editor
    config:function(){
      return function(editor){
        editor.setOption("mode", "html");
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
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // startup code that creates a document in case there isn't one yet.
    if (!Documents.findOne()){// no documents yet!
        Documents.insert({title:"my new document"});
    }
  });

  Meteor.methods({
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

function fixObjectKeys(obj){
  var newObj = {}
  for(key in obj){
    var key2 = key.replace("-", "");
    newObj[key2] = obj[key];
  }
  return newObj;
}
