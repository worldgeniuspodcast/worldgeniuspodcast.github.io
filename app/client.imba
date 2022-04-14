let p = console.log

global css html ff:sans
global css body d:flex fld:column jc:center ai:center m:0 bg:url('./assets/pat.png') of:hidden

def rand min, max
	min = Math.ceil(min)
	max = Math.floor(max)
	Math.floor(Math.random() * (max - min) + min)

tag Funny

	x = 20
	y = 20
	r = 0

	dx = 2
	dy = 2
	dr = 1

	def render
		let dims = self.getBoundingClientRect!

		if dims.x + dims.width >= window.innerWidth - dx
			dx = rand -4, -1
			dr = rand -6, 6
		elif dims.x <= dx
			dx = rand 1, 4
			dr = rand -6, 6

		if dims.y + dims.height >= window.innerHeight - dy
			dy = rand -4, -1
			dr = rand -6, 6
		elif dims.y <= dy
			dy = rand 1, 4
			dr = rand -6, 6

		x += dx
		y += dy
		r += dr
		self.style.transform = "rotate({r}deg)"
		self.style.left = x + 'px'
		self.style.top = y + 'px'

		<self[pos:absolute d:block white-space:nowrap fs:40px]>
			<slot>

tag app

	def render

		<self autorender=30fps>

			css self
				h:100vh w:100% p:0 m:0

			css svg, img
				transition:transform 250ms
				# bxs:1px 1px 10px -5px black
				rd:20px h:100px
				@hover
					transform:scale(1.15)

			<Funny> <a href="https://podcasts.apple.com/us/podcast/world-genius/id1600005067"> <svg src='./assets/itunes.svg'>
			<Funny> <a href="https://www.instagram.com/worldgenius2/"> <svg src='./assets/instagram.svg'>
			<Funny> <a href="https://open.spotify.com/show/3l4hY6Qh4g5MZvHJDB5fi5?si=8181918444734f6c"> <svg src='./assets/spotify.svg'>
			<Funny> <a href="https://www.youtube.com/c/worldgeniuspodcast"> <svg src='./assets/youtube.svg'>
			<Funny> '😘'
			<Funny> '😍'
			<Funny> '😂'
			<Funny> '😭'
			<Funny> '😊'
			<Funny> '😉'
			<Funny> '😱'

imba.mount <app>
