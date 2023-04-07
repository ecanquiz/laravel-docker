import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Laravel-Docker',
  description: 'Dockeriza Laravel',
  base: '/laravel-docker/', //  The default path during deployment / secondary address / base can be used/
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Inicio', link: '/' },           
      { text: 'Comenzar', link: '/guide/intro' },
      { text: 'CaribesTIC', link: 'https://caribestic.github.io/' }, 
    ],
    sidebar: [
      {
        text: 'Guía',   // required
        path: '/guide/',      // optional, link of the title, which should be an absolute path and must exist        
        sidebarDepth: 1,    // optional, defaults to 1 
        items: [
          { text: 'Introducción', link: '/guide/intro' },
          { text: 'Docker', link: '/guide/docker' },
          { text: 'Ejemplo Sencillo', link: '/guide/simple-example' },
          { text: 'Environment Description', link: '/guide/env-desc' },
          { text: 'Conclusión', link: '/guide/conclusion' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CaribesTIC/vue-laravel' }
    ]
  }
})
