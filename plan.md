## Buiding bulk addition of users by sending emails to them.

## first we need the invites model.. 
we save the email of the inivtes sents
the cohort id and the course id
the token of the user that was invited ## to serch for the user when they want to create their account
expiresAt Date for the user who recieved the Date


## When the user accept the invites 
we find the user by the token sent
check if the invite is active or used??..
then we hash the password of the user who click accept invites
enroll the user automatically to the course sent to the user.. this does not folllow the normal route 
add the user to cohorts 
set invites to used 
return user



## Edit Orders by the Admin
Admin edit the stautus of a particular order(done)
Edit the Billing Info of an order(done)
View Single Order (Ongoing)

## Announcement Functionality
Admin to create announcement for a cohort using rest apis and polling from the frontend (ongoing)
Admin to fetch all anouncement 
Admin to delete announcement 
