<h2>THE LORD OF THE RINGS ESOLANG</h2>
Esoteric Programming Language built with TypeScript
<h3>Ran with Deno</h3>
Read in files: "deno run -A main.ts file.lotr"
Repl Mode: no file need --> "deno run -A main.ts"

<h3>Experience</h3>
I was in the middle of a LOTR phase over winter break when I decided to reread the books once more. 
In this and after watching a couple of Youtube videos of esolangs, I thought it would be fitting to attempt to create one. 
The learning for this came directly from <a href="https://github.com/tlaceby">Tyler Laceby</a> and his guide on Youtube, <a href="https://www.youtube.com/playlist?list=PL_2VhOvlMk4UHGqYCLWc6GO8FaPl8fQTh">Build a Custom Scripting</a>.

<h2>The language itself</h2>
<h3>With any file ending with ".lotr" the current language supports:</h3>
<h4>Variables</h4>
Supports: booleans, numbers, strings, and objects.
<pre>
	<code>
hobbit ringBearer become "frodo"
ring elven become "nenya"
	</code>
</pre>
with <code>hobbit</code> replacing <code>let</code> and <code>ring</code> replacing <code>const</code>.
<h4>Functions</h4>
Furthermore a function can be created the same way; however, replacing <code>function</code> with <code>shall</code>
<pre>
	<code>
shall foo(x, y){
	x + y
}
hobbit z = foo(1,3)
speak(z)
	</code>
</pre>
which would result in <code>4</code>.

<h2>Moving Forward</h2>
Overall, the next important steps would be adding functionality to if else statements and loops after a while.
