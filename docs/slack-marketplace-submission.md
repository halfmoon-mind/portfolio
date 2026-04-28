# Slack Marketplace Submission Copy

This document contains draft copy for submitting Half to Full Clips for Slack to
the Slack Marketplace. It is not legal advice.

## App name

Half to Full Clips

## Short description

Curated reading notes delivered to Slack.

## Long description

Half to Full Clips sends new reading notes from halfmoon.day to a Slack channel.

Each Clip is a short personal comment on an external article, with the source
link, optional quote, tags, and a button to read the post on Half to Full.

After installation, choose the Slack channel where notifications should appear.
The app only posts when a new Clip is published and does not read Slack messages,
files, user profiles, email addresses, private channels, or conversation history.

## Pricing

Free.

## Required scope explanation

`incoming-webhook`: Used to post new Half to Full Clip notifications to the Slack
channel selected during installation. The app does not use this scope to read any
Slack data.

## Landing page

https://halfmoon.day/clips/slack

## Privacy Policy

https://halfmoon.day/clips/slack/privacy

## Terms of Service

https://halfmoon.day/clips/slack/terms

## Support

https://halfmoon.day/clips/slack/support

Support email: simsanghyeon00@gmail.com

## Security and compliance notes

- The app uses Slack OAuth v2 with a state parameter.
- The app stores Slack installation metadata and incoming webhook URLs in Netlify Blobs.
- The app does not collect Slack messages, files, user profiles, user email addresses, or conversation history.
- The app does not use generative AI.
- The app does not use Slack data to train models.
- Data deletion requests can be sent to simsanghyeon00@gmail.com.

## Review readiness checklist

- Confirm the app is installed on at least 5 active Slack workspaces before submission.
- Test installation on a workspace that is not the development workspace.
- Test uninstalling the app and requesting deletion of stored install data.
- Prepare a short demo video showing installation, channel selection, a sample notification, and uninstall.
- Add at least one collaborator in the Slack app settings.
