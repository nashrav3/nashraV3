start_command = 
    .description = Start the bot
language_command = 
    .description = Change language

welcome = 👋🏻  Welcome!
language = 
    .select = Please, select your language
    .changed = Language successfully changed!

add-bot = 
    .new-bot-added = New bot added, your bot <b>{$firstName}</b> which is @{$username}!
    .bot-updated = Bot updated your bot <b>{$firstName}</b> which is @{$username}!
    .invalid-token = Invalid token

start_menu = 
    .my_bots = my bots
    .add_bot = add bot

my_bots = 
    .bots_count = { NUMBER($botsCount) ->
      [0] it seems that you have no bots yet. \n to add a new bot, use the /addBot command
      [1] you have one bot.
      [2] you have <b>{$botsCount}</b> bots.
      *[other] you have <b>{$botsCount}</b> bots.
    }

message =
    .edited = message edited
    
message_delivery = 
    .success = Message successfully sent!
    .failed = Message failed to send!
    .message_forwarded = Message forwarded by <b>{$firstName}</b>!
    .you_are_banned = :( the bot owner have banned you from sending messages to him.
    .user_blocked_bot = Message failed to send! this user have blocked the bot.
    .owner_blocked_bot = the bot owner blocked his own bot! 🤦🏻‍♂️

# message_edited_by_sender limited to 0-200 characters
keyboard = 
    .message_edited_by_sender = original message is the message that have been replied to by this message, this is the new version of the message
    .message_edited_by_sender_buttonText = message edited
   
ban = 
    .how_to_use = reply to the message of the user that you want to ban with this command
    .user_banned_successfully = user have been banned successfully
    
unban = 
    .how_to_use = reply to the message of the user that you want to unban with this command
    .user_unbanned_successfully = user have been unbanned successfully

unbanAll = 
    .all_users_unbanned = <b>{ $count }</b> users have been unbanned!

bot_menu =
    .broadcast = broadcast
    .stats = stats
    .replies = replies
    .group_settings = group settings
    .delete_bot = delete bot
    .force_subscribe = force subscribe
    .back = 🔙back
    .mainMenu = 🔝main menu

forceSubMenu = 
    .messageText = here is force subscribe settings
    
broadcast_menu =
    .messageText = broadcast options
    .send_to_all = send message to all users
    .forward_to_all = forward message to all users
    .notify_users = notify users

replies =
    .messageText = replies explained
    .set_reply = add new reply

set_reply=
    .send_trigger = please send the text that the user will send to trigger the reply 
                    for example: /start or hello
    .err_set_reply_cant_be_used_as_trigge = /set_reply can be used as trigger
    .send_context = please send the reply message that you want the user to see when he send ( { $trigger } )
    .success = reply for ( { $trigger } ) has been set successfully!

set_group=
    .messageText = here you can change the settings of the admins group
    .bot_restricted_from_adminsGroup = I have left the group because <b>{ $firstName }</b> have restricted me from sending message in <b>{ $title }</b>
    .messageTextWithGroupInfo = your current group that the bot is forwarding messages to is

    title = <b>{ $title }</b>
    { $inviteLink ->
    [not-provided] ​
    *[other] link = {$inviteLink}
      }
    { $username ->
    [not-provided] ​
    *[other] username = @{$username}
      }
    .group_set_successfully = <b>{ $title }</b> have been set successfully from now on I'll forward all messages to here.
    .how_to_set = how to set group
    .how_to_set_url = https://t.me/+bJSfGztNJiU4NWU5
    .how_to_change = how to chage group
    .how_to_change_url = https://t.me/+bJSfGztNJiU4NWU5
    .delete = delete
    .confirm_delete_messageText = confirm delete!
    .confirm_delete_group_yes = yes
    .confirm_delete_group_no = No!
    .group_deleted_successfully_messageText = the group have been deleted successfully, from now on I'll forward messages to your private chat

delete_bot =
    .confirm_delete_messageText = are you sure about deleting this bot!
    .confirm_delete_bot_no = NO!
    .confirm_delete_bot_yes = yes
    .bot_deleted_successfully_messageText = the bot have been deleted successfully.


start_command = 
    .description = Start the bot
language_command = 
    .description = Change language
admin_command =
    .description = Make user an administrator
stats_command =
    .description = Stats
setcommands_command =
    .description = Set bot commands

language = 
    .select = Please, select your language
    .changed = Language successfully changed!
admin =
    .user-not-found = User not found

    .select-user = Please, select a user to change role
    .select-user-btn = Select user
    .your-role-changed = You're {$role ->
        *[USER] a regular user
        [ADMIN] an administrator
    } now.
    .user-role-changed = User with ID {$id} is now {$role ->
        *[USER] a regular user
        [ADMIN] an administrator
    }.
    
    .commands-updated = Commands updated.

verify-chat = 
    .progress = Broadcasting to {$totalCount}
    
    {$pb}
    {$errors}
    
    {$emojis}

list =
    .empty = you have no channels in the list :(

chat-member = 
    .bot-can-post = اصبح البوت ادمن في القناة هل تود اضافتها في اللستة؟

    اسم القناة: {$name}
    رابط القناة: {$link}
    معرف القناة: @{$username}

    .bot-can-not-post = تم حذف البوت من ادارة القناة وتم حذف القناة من اللستة

    اسم القناة: {$name}
    رابط القناة: {$link}
    معرف القناة: @{$username}


remove-channel = 
    .stats = تم حذف القناة من اللستة بنجاح: 
    {$success}
     
    لا توجد في اللستة:
    {$notFoundUsernames}
    {$notFoundIdsChats}


broadcast-status-keyboard =
    .delete = delete
    .resend = resend

stats =
    .stats = bot stats
    users: {$usersCount}
    posts: {$postsCount}
    channels: {$channelsCount}
    groups: {$groupsCount}
    owner: {$owner}
    posts in channels: {$postsInChannels}
    list channels: {$listChannelsCount}
    control group: {$controlGroup}
    is premium?: {$isPremium}
    expire at: {$expireAt}

start-private =
    .text = Welcome to the bot, you can use the following commands
    .create-post-button-reply = forward a message here to create a post
start-private-keyboard =
    .create-post = create post
    .edit-post = edit post
    .instructions = instructions
    .change-language = change language
    .create-your-own-bot = create your own bot