# BugBoy

BugBoy is a Discord bot and web interface built using Node.JS. It serves as a simple way of tracking bugs.

## Usage

### Adding a bug report
You can add a bug report by sending the following message in any channel of the server:

**`/bug`**`<bug title>`

The bare minimum for a bug report is the title, however you can add more details with the following flags (in any order):

**`/bug`**`<bug title> `**`/details`**`<more details about the bug> `**`/platform`**`<name of the platform the bug is occuring on> `**`/severity`**`<how bad the bug is, from 1-10>`

By default, platform is set to `all` and "severity" is set to `1`. 

### Other commands

| Action      | Command(s)                      | Description                             | Example   |
| ----------- | ------------------------------- | --------------------------------------- | --------- |
| View help   | **`/bug`**         | View all commands available to the user who asked    |           |
| List bugs   | **`/bugs`**, `/buglist`         | List all the bugs                       |           |
| Remove a bug | **`/bugremove`**, `/bugdelete` | Remove all bugs, specified by position. | `/bugremove 4, 12 2 and 3` |
| Mark a bug as fixed | **`/bugfix`** | Mark a bug as fixed | `/bugfix 2, 3` |
| Respond to a bug | **`/bugrespond`**, `/buganswer` | Add a response to the bug specified by index | `/bugrespond 12 this is kind of fixed` |
| Move a bug | **`/bugmove`** | Move a bug from it's first position to a new one | `/bugmove 12 to 1` |
| Bot info   | **`/bugboy`**         | View information about the node process |           |           |

### Notes

* Anyone can report a bug, or view the bug report list, but only members with the "Edit Guild" permission can use the other commands.

* The `/bugremove`, `/bugfix`, and`/bugmove` commands can have any non-numeric characters between the bug report positions. For example, `/bugmove 12 2` is just as valid as `/bugmove 12hello2` or `/bugmove 12 to the position 2`.

