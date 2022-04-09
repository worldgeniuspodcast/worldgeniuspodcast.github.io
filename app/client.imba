global css html ff:sans
global css body d:flex fld:column jc:center ai:center m:0 bg:#ffa8d5

tag app

	<self>

		css self
			d:flex fld:column jc:flex-start ai:center h:100% w:100%

		css svg, img
			transition:transform 250ms
			bxs:1px 1px 10px -5px black
			rd:20px mb:20px h:100px

			@hover
				transform:scale(1.08)

		css .links
			d:flex fld:column jc:flex-start ai:center w:100% py:40px

		<.links>
			<a href="https://www.youtube.com/channel/UC4gV5mwN6hCZxnoJ4jX5YWg"> <svg src='./assets/youtube.svg'>
			<a href="https://www.instagram.com/worldgenius2/"> <svg src='./assets/instagram.svg'>
			<a href="https://podcasts.apple.com/us/podcast/world-genius/id1600005067"> <svg src='./assets/itunes.svg'>
			<a href="https://open.spotify.com/show/3l4hY6Qh4g5MZvHJDB5fi5?si=8181918444734f6c"> <svg src='./assets/spotify.svg'>

imba.mount <app>
