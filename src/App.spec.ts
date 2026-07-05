import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>home</div>' } }],
})

describe('App', () => {
  it('mounts without errors', async () => {
    const wrapper = mount(App, {
      global: { plugins: [router] },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
