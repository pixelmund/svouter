<script>
	import { Router, Route } from '$lib';
	import Home from './Home.svelte';
	import About from './About.svelte';
	import Layout from './Layout.svelte';
</script>

<Router>
	<Layout>
		<Route path="/" canActivate={true}>
			<Home />
		</Route>
		<Route path="/about" canActivate={true}>
			<About />
		</Route>
	</Layout>
	<Route path="*">
		<div>
			<h1>404</h1>
			<a href="/">Home</a>
		</div>
	</Route>
</Router>
