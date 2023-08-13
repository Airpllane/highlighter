console.log("START")
var isActive = false;

const parent = document;
const generatedArray = depthFirstTraversal(parent);

var searchObjects;

chrome.storage.sync.get(["searchJSON"]).then((result) =>
{
    searchObjects = JSON.parse(result.searchJSON);
    highlightAll();
});

document.onkeydown = (event) =>
{
    if (event.repeat) return;
    if(event.ctrlKey && event.shiftKey && event.code == "Backquote")
    {
        switchActive();
    }
};

function depthFirstTraversal(node) {
  let charsNum = 0;
  let result = [];

  function addResult(text, node) {
    result.push({ text: text, node: node, start: charsNum, end: charsNum + text.length });
    charsNum += text.length;
  }

  function traverse(node) {
    if (!node) return;

    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '' && node.parentElement.tagName.toLowerCase() !== 'rt') {
      addResult(node.textContent, node);
    } else if (node.tagName && (node.tagName.toLowerCase() === 'br' || node.tagName.toLowerCase() === 'p')) {
      addResult('\n', node);
    }

    const children = node.childNodes;
    children.forEach(traverse);

    if (node.tagName && node.tagName.toLowerCase() === 'p') {
      addResult('\n', node);
    }
  }

  traverse(node);
  return result;
}

function concatenateTexts(array) {
  let result = '';
  
  for (let i = 0; i < array.length; i++) {
    result += array[i].text;
  }
  
  return result;
}

function findNodesBySubstring(array) {
  let allSubstringNodes = [];

  for (let i = 0; i < searchObjects.length; i++) {
    for(let j = 0; j < searchObjects[i].aliases.length; j++){
      let substring = searchObjects[i].aliases[j];
      let startIndex = 0;
      let endIndex = 0;

      while (startIndex !== -1) {
        const concatenatedString = concatenateTexts(array);
        startIndex = concatenatedString.indexOf(substring, endIndex);
        endIndex = startIndex + substring.length;

        if (startIndex === -1) {
          break;
        }

        const substringNodes = getSubstringNodes(array, startIndex, endIndex);
        substringNodes.forEach(node => {
          allSubstringNodes.push({
            node: node.node,
            searchObjectID: i,
            startIndex: node.start,
            endIndex: node.end
          });
        });
      }
    }
  }

  return allSubstringNodes;
}

function getSubstringNodes(array, startIndex, endIndex) {
  return array
    .filter(node => isNodeOverlapping(node, startIndex, endIndex))
    .map(node => getSubstringNode(node, startIndex, endIndex));
}

function isNodeOverlapping(node, startIndex, endIndex) {
  const nodeStart = node.start;
  const nodeEnd = node.end;

  return Math.max(startIndex, nodeStart) < Math.min(endIndex, nodeEnd);
}

function getSubstringNode(node, startIndex, endIndex) {
  const nodeStart = node.start;

  const nodeSubaliasestart = Math.max(startIndex - nodeStart, 0);
  const nodeSubstringEnd = Math.min(endIndex - nodeStart, node.text.length);

  return {
    node: node.node,
    start: nodeSubaliasestart,
    end: nodeSubstringEnd
  };
}

function highlightSubstringNodes(nodesWithCoordinates) {
  let nodeGroups = groupByNode(nodesWithCoordinates);

  nodeGroups.forEach((nodeDataArray, node) => {
    highlightNode(node, nodeDataArray);
  });
}

function groupByNode(nodesWithCoordinates) {
  let groups = new Map();

  nodesWithCoordinates.forEach(nodeData => {
    if (!groups.has(nodeData.node)) {
      groups.set(nodeData.node, []);
    }
    groups.get(nodeData.node).push(nodeData);
  });

  return groups;
}

function highlightNode(node, nodeDataArray) {
  let nodeText = node.nodeValue;

  nodeDataArray.sort((a, b) => a.startIndex - b.startIndex);

  let previousEndIndex = 0;
  let parentNode = node.parentNode;

  nodeDataArray.forEach(nodeData => {
    if(nodeData.startIndex < previousEndIndex) {
      return;
    }

    let beforeMarkText = nodeText.substring(previousEndIndex, nodeData.startIndex);
    let beforeMarkNode = document.createTextNode(beforeMarkText);

    let markedText = nodeText.substring(nodeData.startIndex, nodeData.endIndex);
    let markedNode = document.createElement('mark');
    markedNode.className = 'search-object';
    markedNode.setAttribute('data-search-object-id', nodeData.searchObjectID);
    markedNode.appendChild(document.createTextNode(markedText));
    markedNode.style.backgroundColor = searchObjects[nodeData.searchObjectID].color;
    
    markedNode.onmouseover = (event) =>
    {
        if(!isActive) return;
        var tooltip = document.createElement('div');
        document.body.appendChild(tooltip);
        
        tooltip.textContent = searchObjects[nodeData.searchObjectID].description;
        tooltip.className = 'tooltip';
        
        let rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + window.scrollX + 'px';
        tooltip.style.top = rect.top + window.scrollY + rect.height + 'px';
        markedNode.onmouseout = () =>
        {
            tooltip.remove();
        }
    }

    

    parentNode.insertBefore(beforeMarkNode, node);
    parentNode.insertBefore(markedNode, node);
    

    previousEndIndex = nodeData.endIndex;
  });

  let afterLastMarkText = nodeText.substring(previousEndIndex);
  let afterLastMarkNode = document.createTextNode(afterLastMarkText);
  parentNode.insertBefore(afterLastMarkNode, node);

  parentNode.removeChild(node);
}

function switchActive()
{
    if(isActive)
    {   
        clearAll();
    }
    else
    {
        showAll();
    }
}

function highlightAll()
{
    if(isActive) return;
    highlightSubstringNodes(findNodesBySubstring(generatedArray, searchObjects));
    isActive = !isActive;
}

function showAll()
{
    if(isActive) return;
    document.querySelectorAll('.search-object').forEach((element) =>
    {
        element.style.backgroundColor = searchObjects[element.getAttribute('data-search-object-id')].color;   
    });
    isActive = !isActive;
}

function clearAll()
{
    if(!isActive) return;
    document.querySelectorAll('.search-object').forEach((element) =>
    {
        element.style.backgroundColor = '#00000000';   
    });
    isActive = !isActive;
}