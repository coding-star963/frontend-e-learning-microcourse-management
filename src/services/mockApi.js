import {
  users,
  categories,
  courses,
  mockAdmin,
  getNextUserId,
  getNextCourseId,
  getNextCategoryId,
} from './mockData';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

function extractFormData(formData) {
  if (formData instanceof FormData) {
    const obj = {};
    for (const [key, value] of formData.entries()) {
      if (key === '_method') continue;
      obj[key] = value;
    }
    return obj;
  }
  return formData;
}

function paginate(items, params = {}) {
  const page = parseInt(params.page) || 1;
  const perPage = parseInt(params.per_page) || 10;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedItems = items.slice(start, end);

  return {
    data: paginatedItems,
    meta: {
      current_page: page,
      last_page: Math.ceil(items.length / perPage),
      per_page: perPage,
      total: items.length,
      from: start + 1,
      to: Math.min(end, items.length),
    },
  };
}

function matchParams(item, params) {
  if (params.search) {
    const q = params.search.toLowerCase();
    const matchTitle = item.title?.toLowerCase().includes(q);
    const matchName = item.name?.toLowerCase().includes(q);
    const matchEmail = item.email?.toLowerCase().includes(q);
    if (!matchTitle && !matchName && !matchEmail) return false;
  }
  if (params.status && item.status !== params.status) return false;
  if (params.role && item.role !== params.role) return false;
  if (params.category_id && String(item.category?.id) !== String(params.category_id)) return false;
  return true;
}

function makeResponse(data, extra = {}) {
  return { data: { ...extra, ...data } };
}

const apiStore = {
  users: [...users],
  categories: [...categories],
  courses: [...courses],
  currentUser: null,
};

const mockApi = {
  async get(url, config = {}) {
    await delay();
    const params = config.params || {};

    if (url === '/user') {
      if (!apiStore.currentUser) {
        return makeResponse({ data: null }, { message: 'Unauthenticated' });
      }
      return makeResponse({ data: apiStore.currentUser });
    }

    if (url === '/courses') {
      let filtered = [...apiStore.courses];
      filtered = filtered.filter((c) => matchParams(c, params));
      return makeResponse(paginate(filtered, params));
    }

    if (url.startsWith('/courses/') && url !== '/courses/categories') {
      const slug = url.split('/courses/')[1];
      const course = apiStore.courses.find((c) => c.slug === slug);
      if (!course) throw { response: { status: 404, data: { message: 'Course not found' } } };
      return makeResponse({ data: course });
    }

    if (url === '/courses/categories') {
      return makeResponse({ data: apiStore.categories });
    }

    if (url === '/categories') {
      let filtered = [...apiStore.categories];
      filtered = filtered.filter((c) => matchParams(c, params));
      return makeResponse(paginate(filtered, params));
    }

    if (url.startsWith('/categories/')) {
      const slug = url.split('/categories/')[1];
      const category = apiStore.categories.find((c) => c.slug === slug);
      if (!category) throw { response: { status: 404, data: { message: 'Category not found' } } };
      return makeResponse({ data: category });
    }

    if (url === '/users') {
      let filtered = [...apiStore.users];
      filtered = filtered.filter((u) => matchParams(u, params));
      return makeResponse({ data: filtered });
    }

    if (url.startsWith('/users/')) {
      const id = parseInt(url.split('/users/')[1]);
      const user = apiStore.users.find((u) => u.id === id);
      if (!user) throw { response: { status: 404, data: { message: 'User not found' } } };
      return makeResponse({ data: user });
    }

    throw { response: { status: 404, data: { message: 'Not found' } } };
  },

  async post(url, body = {}) {
    await delay();
    const data = extractFormData(body);

    if (url === '/login') {
      const { email, password } = data;
      if (email === 'admin@example.com' && password === 'password') {
        apiStore.currentUser = { ...mockAdmin };
        return makeResponse({ user: { ...mockAdmin }, token: 'mock-jwt-token-12345' });
      }
      const foundUser = apiStore.users.find((u) => u.email === email);
      if (foundUser && password === 'password') {
        apiStore.currentUser = { ...foundUser };
        return makeResponse({ user: { ...foundUser }, token: 'mock-jwt-token-12345' });
      }
      throw { response: { status: 401, data: { message: 'Invalid credentials.' } } };
    }

    if (url === '/logout') {
      apiStore.currentUser = null;
      return makeResponse({ message: 'Logged out successfully.' });
    }

    if (url === '/profile/photo') {
      return makeResponse({ user: { ...apiStore.currentUser }, message: 'Photo updated.' });
    }

    if (url.startsWith('/courses/') && url.endsWith('/publish')) {
      const slug = url.split('/courses/')[1].replace('/publish', '');
      const course = apiStore.courses.find((c) => c.slug === slug);
      if (course) course.status = 'published';
      return makeResponse({ message: 'Course published successfully.' });
    }

    if (url.startsWith('/courses/') && url.endsWith('/unpublish')) {
      const slug = url.split('/courses/')[1].replace('/unpublish', '');
      const course = apiStore.courses.find((c) => c.slug === slug);
      if (course) course.status = 'draft';
      return makeResponse({ message: 'Course unpublished successfully.' });
    }

    if (url.startsWith('/courses/') && url.endsWith('/archive')) {
      const slug = url.split('/courses/')[1].replace('/archive', '');
      const course = apiStore.courses.find((c) => c.slug === slug);
      if (course) course.status = 'archived';
      return makeResponse({ message: 'Course archived successfully.' });
    }

    if (url === '/courses') {
      const id = getNextCourseId();
      const slug = data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `course-${id}`;
      const newCourse = {
        id,
        slug,
        title: data.title || 'Untitled Course',
        description: data.description || '',
        category: data.category_id ? apiStore.categories.find((c) => c.id === parseInt(data.category_id)) || null : null,
        difficulty_level: data.difficulty_level || 'beginner',
        duration: data.duration || '',
        status: data.status || 'draft',
        thumbnail: null,
        teacher: { id: apiStore.currentUser?.id || 1, name: apiStore.currentUser?.name || 'Admin User' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      apiStore.courses.push(newCourse);
      return makeResponse({ course: newCourse, message: 'Course created successfully.' });
    }

    if (url.startsWith('/users/')) {
      const parts = url.split('/');
      const id = parseInt(parts[2]);
      if (parts[3] === 'toggle-status') {
        const user = apiStore.users.find((u) => u.id === id);
        if (user) user.is_active = !user.is_active;
        return makeResponse({ user: { ...user }, message: 'User status updated.' });
      }
    }

    if (url === '/users') {
      const id = getNextUserId();
      const newUser = {
        id,
        name: data.name || 'New User',
        email: data.email || `user${id}@example.com`,
        role: data.role || 'student',
        is_active: true,
        profile_photo: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      apiStore.users.push(newUser);
      return makeResponse({ message: 'User created successfully.' });
    }

    if (url === '/categories') {
      const id = getNextCategoryId();
      const name = data.name || 'New Category';
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newCategory = {
        id,
        slug,
        name,
        description: data.description || '',
        courses_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      apiStore.categories.push(newCategory);
      return makeResponse({ message: 'Category created successfully.' });
    }

    throw { response: { status: 404, data: { message: 'Not found' } } };
  },

  async put(url, body = {}) {
    await delay();
    const data = extractFormData(body);

    if (url === '/profile') {
      if (apiStore.currentUser) {
        Object.assign(apiStore.currentUser, data);
      }
      return makeResponse({ user: { ...apiStore.currentUser }, message: 'Profile updated.' });
    }

    if (url === '/profile/password') {
      return makeResponse({ message: 'Password updated successfully.' });
    }

    if (url.startsWith('/courses/') && url.endsWith('/status')) {
      const slug = url.split('/courses/')[1].replace('/status', '');
      const course = apiStore.courses.find((c) => c.slug === slug);
      if (course) course.status = data.status;
      return makeResponse({ message: 'Status updated.' });
    }

    if (url.startsWith('/courses/')) {
      const slug = url.split('/courses/')[1];
      const courseIndex = apiStore.courses.findIndex((c) => c.slug === slug);
      if (courseIndex !== -1) {
        const course = apiStore.courses[courseIndex];
        if (data.title) course.title = data.title;
        if (data.description !== undefined) course.description = data.description;
        if (data.category_id) {
          course.category = apiStore.categories.find((c) => c.id === parseInt(data.category_id)) || null;
        }
        if (data.difficulty_level) course.difficulty_level = data.difficulty_level;
        if (data.duration !== undefined) course.duration = data.duration;
        if (data.status) course.status = data.status;
        course.updated_at = new Date().toISOString();
        apiStore.courses[courseIndex] = { ...course };
        return makeResponse({ course: { ...course }, message: 'Course updated successfully.' });
      }
    }

    if (url.startsWith('/categories/')) {
      const slug = url.split('/categories/')[1];
      const category = apiStore.categories.find((c) => c.slug === slug);
      if (category) {
        if (data.name) category.name = data.name;
        if (data.description !== undefined) category.description = data.description;
        category.updated_at = new Date().toISOString();
      }
      return makeResponse({ message: 'Category updated successfully.' });
    }

    if (url.startsWith('/users/')) {
      const id = parseInt(url.split('/users/')[1]);
      const user = apiStore.users.find((u) => u.id === id);
      if (user) {
        if (data.name) user.name = data.name;
        if (data.email) user.email = data.email;
        if (data.role) user.role = data.role;
        user.updated_at = new Date().toISOString();
      }
      return makeResponse({ message: 'User updated successfully.' });
    }

    throw { response: { status: 404, data: { message: 'Not found' } } };
  },

  async delete(url) {
    await delay();

    if (url.startsWith('/courses/')) {
      const slug = url.split('/courses/')[1];
      const index = apiStore.courses.findIndex((c) => c.slug === slug);
      if (index !== -1) apiStore.courses.splice(index, 1);
      return makeResponse({ message: 'Course deleted successfully.' });
    }

    if (url.startsWith('/categories/')) {
      const slug = url.split('/categories/')[1];
      const index = apiStore.categories.findIndex((c) => c.slug === slug);
      if (index !== -1) apiStore.categories.splice(index, 1);
      return makeResponse({ message: 'Category deleted successfully.' });
    }

    throw { response: { status: 404, data: { message: 'Not found' } } };
  },

  create() {
    return {
      defaults: { headers: { common: {} } },
      interceptors: {
        request: { use: () => {} },
        response: { use: () => {} },
      },
      get: (url, cfg) => mockApi.get(url, cfg),
      post: (url, body, cfg) => mockApi.post(url, body, cfg),
      put: (url, body, cfg) => mockApi.put(url, body, cfg),
      delete: (url) => mockApi.delete(url),
    };
  },
};

export default mockApi;
