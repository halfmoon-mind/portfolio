import { config, fields, collection } from '@keystatic/core';

const isLocal = import.meta.env.DEV;

export default config({
  storage: isLocal
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: {
          owner: 'halfmoon-mind',
          name: 'portfolio',
        },
      },

  collections: {
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        pubDate: fields.date({ label: 'Publish Date' }),
        updatedDate: fields.date({ label: 'Updated Date' }),
        heroImage: fields.image({
          label: 'Hero Image',
          directory: 'public/blog',
          publicPath: '/blog/',
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),

    portfolio: collection({
      label: 'Portfolio',
      slugField: 'title',
      path: 'src/content/portfolio/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        pubDate: fields.date({ label: 'Publish Date' }),
        updatedDate: fields.date({ label: 'Updated Date' }),
        startDate: fields.date({ label: 'Project Start Date' }),
        endDate: fields.date({ label: 'Project End Date' }),
        heroImage: fields.image({
          label: 'Hero Image',
          directory: 'public/portfolio',
          publicPath: '/portfolio/',
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        githubUrl: fields.url({ label: 'GitHub URL' }),
        liveUrl: fields.url({ label: 'Live URL' }),
        webUrl: fields.url({ label: 'Web URL' }),
        storeUrl: fields.url({ label: 'Store URL' }),
        youtubeUrl: fields.url({ label: 'YouTube URL' }),
        iosUrl: fields.url({ label: 'iOS App Store URL' }),
        androidUrl: fields.url({ label: 'Android Play Store URL' }),
        slackUrl: fields.url({ label: 'Slack Marketplace URL' }),
        docUrl: fields.url({ label: 'Documentation URL' }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),

    til: collection({
      label: 'TIL',
      slugField: 'title',
      path: 'src/content/til/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        pubDate: fields.date({ label: 'Publish Date' }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        heroImage: fields.image({
          label: 'Hero Image',
          directory: 'public/til',
          publicPath: '/til/',
        }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),

    clips: collection({
      label: 'Clips',
      slugField: 'title',
      path: 'src/content/clips/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        pubDate: fields.date({ label: 'Publish Date' }),
        sourceUrl: fields.url({
          label: 'Source URL',
          validation: { isRequired: true },
        }),
        sourceTitle: fields.text({ label: 'Source Title' }),
        quote: fields.text({ label: 'Quote', multiline: true }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        heroImage: fields.image({
          label: 'Hero Image',
          directory: 'public/clips',
          publicPath: '/clips/',
        }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
  },
});
