import $ from 'jquery';

import '../../resources/bpmn-font/css/bpmn.css';
import '../../resources/diagram-js.css';
import '../../resources/postit-js.css';

import PostItModeler from '../../lib/Modeler';

import diagramXML from '../resources/newBoard.xml';

// modeler instance
var modeler = new PostItModeler({
  container: '#canvas',
  keyboard: {
    bindTo: window,
  },
});

function openFile(file, callback) {

  // check file api availability
  if (!window.FileReader) {
    return window.alert(
      'Looks like you use an older browser that does not support drag and drop. ' +
      'Try using a modern browser such as Chrome, Firefox or Internet Explorer > 10.');
  }

  // no file chosen
  if (!file) {
    return;
  }

  var reader = new FileReader();

  reader.onload = function(e) {

    var xml = e.target.result;

    callback(xml);
  };

  reader.readAsText(file);
}

var fileInput = $('<input type="file" />').appendTo(document.body).css({
  width: 1,
  height: 1,
  display: 'none',
  overflow: 'hidden'
}).on('change', function(e) {
  openFile(e.target.files[0], openDiagram);
});


function openDiagram(xml) {
  // import diagram
  modeler.importXML(xml, function(err) {
    if (err) {
      return console.error('could not import postit diagram', err);
    }
  });
}

function saveSVG(done) {
  modeler.saveSVG(done);
}

function saveDiagram(done) {

  modeler.saveXML({ format: true }, function(err, xml) {
    done(err, xml);
  });
}

// bootstrap diagram functions
$(function() {

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  var openNew = $('#js-open-new');
  var openBoard = $('#js-open-diagram');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(downloadSvgLink, 'board.svg', err ? null : svg);
    });

    saveDiagram(function(err, xml) {
      setEncoded(downloadLink, 'board.xml', err ? null : xml);
    });
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);

  openNew.click(function() {
    openDiagram(diagramXML);
  });

  openBoard.on('click', function() {
    var input = $(fileInput);

    // clear input so that previously selected file can be reopened
    input.val('');
    input.trigger('click');
  });

});


openDiagram(diagramXML);


// helpers //////////////////////

function debounce(fn, timeout) {
  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}
