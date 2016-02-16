# General
- Change types in mongodb
  db.posts.find({type: 'kb'}).forEach(function(post) { db.posts.update({_id: post._id},{$set: { "type": "hobby" }}) });
  db.posts.find({type: 'blog'}).forEach(function(post) { db.posts.update({_id: post._id},{$set: { "type": "article" }}) });
  db.bookmarks.find({category: 'fun'}).forEach(function(bookmark) { db.bookmarks.update({_id: bookmark._id},{$set: { "category": "todo" }}) });
  db.bookmarks.find({category: 'kb'}).forEach(function(bookmark) { db.bookmarks.update({_id: bookmark._id},{$set: { "category": "other" }}) });

- vCard with N:Lastname;firstname

- Labels as selectbox add the end of title inputbox.
- After login, show processbar for loading localdata
- jwt token expire feedback must be better from the api
- https://sroze.github.io/ngInfiniteScroll/
- https://github.com/angular-translate/angular-translate

# Calendar
- Share event time not corret. UTC?
- export vCal
- import vCal

# Issues
- Upload contact photo on ipad does not work correct.
  https://github.com/fengyuanchen/cropper/issues/294

- Share PDF with bullet list does not work correct with <ul><li>

# Other

- Sync-it https://www.npmjs.com/package/sync-it
