# What this is:

A Blockbench (BB) plugin that handles importing and exporting from and to the Vintage Story (VS) shape format to make it a viable alternative to Vintage Story Model Creator (VSMC). The VS shape format is similar to the BB format but still different in a few key aspects.

# How to install:

Open Blockbench and select "File->Plugins..." then drag-and-drop the vs_plugin.js  file into the window that opens and you are ready to go.

# Basic use:

After the plugin is installed it should be possible to open VS shape files via "File->Open Model" or create new ones with "File->New->Vintage Story Base Format". There should also be new Actions in the Import and Export sections to import from and export to VS shape format.

For Blockbench to figure out texture paths from the base game on its own, I added a setting under "File->Preferences->Settings". Under "General" right at the bottom should be a folder icon called "Game Path". When clicking on it you should be able to select the path to your game folder.

# This still needs work:

- ~~Animation export and import not implemented yet~~ 
- Automatic BackDropShape handling not implemented yet
- Attachment points not implemented yet
- Reexported file structure is more complicated than it needs to be

# Building the Plugin

You can build the plugin with

```console
npm install
npm run build
```
This should build the plugin with webpack into .../dist/vs_plugin.js which can then be imported to BB.