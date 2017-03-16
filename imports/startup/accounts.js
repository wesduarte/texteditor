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
