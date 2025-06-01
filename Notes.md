# Why Create a `<div>` Without Adding It to the UI in line no 5?
We're using the `<div>` as a temporary container to parse the HTML that came from the server (via response.text()).  
By putting it in `div.innerHTML`, we let the browser parse it into real DOM elements, so we can extract them like:
```js
let a = div.getElementsByTagName('a');
```

## ✅ This Pattern Is Called "DOM Parsing Without Rendering"
You use it when:
- The server gives you raw HTML
- You want to extract some data from it
- But you don’t want to display that HTML directly