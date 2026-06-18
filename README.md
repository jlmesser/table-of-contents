## Obsidian Table of Contents Plugin
A dynamic, customizable Table of Contents (ToC) generator for Obsidian. This plugin parses your note's headings and creates clean, clickable wiki links back to your sections.
It features flexible global options alongside per-note local overrides.
------------------------------
## Features
## Smart Markdown Cleaning
The plugin automatically strips complex Markdown styling from your headings so they look clean and legible in your generated list, while still linking back to the styled heading accurately.

* Strips Formatting: Removes formatting like **bold**, *italics*, ==highlights==, and ~~strikethroughs~~.
* Preserves Code Syntax: Retains raw code characters inside code blocks `* _ ~ = [ ] ``.
* Handles Links: Converts existing internal links [[Link Text|Renamed]] or external Markdown links \[Text\](url) into plain text inside the generated table.

## Local Settings Overrides
You can fine-tune how the ToC behaves on a per-note basis by adding inline configuration variables within your note's source text:

* indent Control: Enforce or disable nesting for specific notes using flags. Customize the spacing character count (e.g., indent' ', indent'\t').
* ToC Heading Removal: Control whether the heading "Table Of Contents" should be omitted or included in the generated tree.
* List Type Toggling: Swap between bullet points and numbered lists. (more styles coming soon)

------------------------------
## Configuration Settings
You can configure the global defaults for all your notes via the plugin settings tab.

| Setting Name | Description | Default Value | Options |
|---|---|---|---|
| Indent nested headings | Enable or disable sub-heading indentation across your notes. | true (Enabled) | Toggle On/Off |
| Remove table of contents heading | Automatically filter out any heading titled exactly "Table Of Contents" so it doesn't self-reference. | true (Enabled) | Toggle On/Off |
| List type | Set the default marker style for your list items. | numberedList | Numbered list, Bulleted list |
| Indent string | Choose the character template used to step out nested levels. | Tab (\t) | Tab, 3 Spaces, 2 Spaces, 1 Space |

------------------------------
## Local/Per-Note Configuration
You can override your global settings on a per-note basis by adding specific configuration flags directly into your note's source text. The plugin scans the text inside the code block for these keywords to dynamically adjust how the Table of Contents generates for that specific file.
## Local Override Options

| Action | Keyword / Format | Description                                                          |
|---|---|----------------------------------------------------------------------|
| Force Indentation | doIndent | Forces sub-headings to indent, ignoring a global "off" setting.      |
| Disable Indentation | doNotIndent | Flattens your list entirely.                                         |
| Custom Indent Spacing | indent'[spaces/tabs]' | Enforces a specific spacing style (e.g., indent'  ' for two spaces). |
| Force List Type | numberedList or bulletedList | Manually switches the list style for this note.                      |
| Hide ToC Heading | doRemoveToc | Ensures a heading named "Table Of Contents" is hidden.               |
| Show ToC Heading | doNotRemoveToc | Forces the ToC heading to appear in the list.                        |

## Examples

![](resources/Pasted%20image%2020260618042546.png)
![](resources/Pasted%20image%2020260618042511.png)
![](resources/Pasted%20image%2020260618042528.png)
![](resources/Pasted%20image%2020260618045503.png)
![](resources/Pasted%20image%2020260618042912.png)
![](resources/Pasted%20image%2020260618042948.png)
![](resources/Pasted%20image%2020260618042955.png)
![](resources/Pasted%20image%2020260618043452.png)
![](resources/Pasted%20image%2020260618043332.png)

------------------------------
## Installation

**not published yet**


### Adding your plugin to the community plugin list

- Check the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

### Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

### when it is published

1. Open Obsidian and head to Settings > Community Plugins.
2. Turn off Safe Mode if you haven't already.
3. Click Browse and search for Table of Contents (or your specific plugin name).
4. Click Install, then click Enable.

------------------------------
## Contributing & Testing
This project uses Jest for its test suite. If you want to expand formatting or logic rules, you can run and check existing criteria:

# Install dependencies
npm install
# Run the test suites
npm run test

The codebase contains tests specifically targeting:

* Markdown removal edge cases (escaped characters, bracket preservation).
* Correctly formatted target wikilinks ([[Note#Heading|Display Text]]).
* Global-to-local configuration inheritance priority.

------------------------------
If you need any adjustments to match how users invoke the plugin, please let me know:

* What command or Markdown block triggers the ToC generation? (e.g., a %%toc%% comment, a code block, or a command palette action?)
* Do you want to add code block examples showing the exact syntax for local configuration overrides?

Let me know how you want to expand these sections!

---

