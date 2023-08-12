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

function findNodesBySubstring(array, searchObjects) {
  let allSubstringNodes = [];

  for (let searchObject in searchObjects) {
    for(let i=0; i<searchObjects[searchObject].strings.length; i++){
      let substring = searchObjects[searchObject].strings[i];
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
            searchObject: searchObjects[searchObject],
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

  const nodeSubstringStart = Math.max(startIndex - nodeStart, 0);
  const nodeSubstringEnd = Math.min(endIndex - nodeStart, node.text.length);

  return {
    node: node.node,
    start: nodeSubstringStart,
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
    markedNode.appendChild(document.createTextNode(markedText));
    markedNode.style.backgroundColor = nodeData.searchObject.color;

    parentNode.insertBefore(beforeMarkNode, node);
    parentNode.insertBefore(markedNode, node);
    

    previousEndIndex = nodeData.endIndex;
  });

  let afterLastMarkText = nodeText.substring(previousEndIndex);
  let afterLastMarkNode = document.createTextNode(afterLastMarkText);
  parentNode.insertBefore(afterLastMarkNode, node);

  parentNode.removeChild(node);
}
console.log("TEST")

const parent = document;
const generatedArray = depthFirstTraversal(parent);
const searchObjects = {
  "n1": {
    "strings": ["綾小路清隆", "綾小路", "清隆"],
    "color": "#AFE1AF"
  },
  "n2": {
    "strings": ["堀北鈴音", "堀北", "鈴音"],
    "color": "#FF5733"
  },
  "n3": {
    "strings": ["櫛田桔梗", "櫛田", "桔梗"],
    "color": "#00FFFF"
  },
  "n4": {
    "strings": ["須藤健", "須藤", "健"],
    "color": "#DFFF00"
  }
}
console.log(findNodesBySubstring(generatedArray, searchObjects))


highlightSubstringNodes(findNodesBySubstring(generatedArray, searchObjects))