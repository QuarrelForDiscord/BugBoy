# BugBoy

BugBoy is a Discord bot and web interface built using Node.JS. It serves as a simple way of tracking bugs.

## Usage

### Adding a bug report
You can add a bug report by sending the following message in any channel of the server:

**`/bug`**`<bug title>`

The bare minimum for a bug report is the title, however you can add more details with the following flags (in any order):

**`/bug`**`<bug title> `**`/details`**`<more details about the bug> `**`/platform`**`<name of the platform the bug is occuring on> `**`/severity`**`<how bad the bug is, from 1-10>`

By default, platform is set to `all` and "severity" is set to `1`. 

### Managing bugs

**`/bug list`**: List all bugs currently reported

**`/bug remove`**` <bug title or position>`: Remove the specified bug

**`/bug respond`**` <bug title or position>`: Remove the specified bug

**`/bug move`**` <old position> <new position> `: Move the specified bug

The remove, move, and respond commands are only accesible to roles with the permission to delete messages.

## Examples

`/bug All channels are visible no matter the permissions /details if you don't have permission to view a channel, it is still visible to you, except if something happens /platform all /severity 5`

Will add the following bug report:

**Title**: All channels are visible no matter the permissions

**Details**: If you don't have permission to view a channel, it is still visible to you, except if something happens

**Platform**: All platforms

**Severity**: 5
