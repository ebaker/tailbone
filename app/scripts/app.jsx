var App = React.createClass({
  getInitialState: function() {
    return {
      files: [],
      activeFile: '',
      log: []
    };
  },
  componentDidMount: function(){
    var that = this;
    this.socket = io.connect(API_ENDPOINT + '/client');
    this.socket.on('connect', function(){
      console.log('App connected to socket');
      that.socket.emit('files:read', '');
    });
    this.socket.on('error', function(err){
      console.log('App error occurred', err);
    });
    this.socket.on('disconnect', function(){
      console.log('App disconnected to socket');
    });
    this.socket.on('files', function(data) {
      console.log('files', data[0]);
      that.state.files.push(data[0]);
      if (!that.state.activeFile){
        that.onActivate(data[0]._id);
        // that.setState({activeFile: data[0]._id});
      }
      that.setState({files: that.state.files});
      console.log('files updated', that.state.files);
    });
    this.socket.on('logline', function(data) {
      // step 1 - check if activeFile
      // step 2 - add to state.log
      console.log('logline', data.fid, that.state.activeFile);
      if (that.state.activeFile == data.fid){
        console.log('that.state.log', that.state.log);
        that.state.log.push(data);
        that.setState({log: that.state.log});
      }
    });
  },
  onActivate: function(id){
    console.log('onActivate', id);
    this.setState({activeFile: id, log: []});
    this.socket.emit('log:read', {_id: id});
  },
  render: function() {
  return (
    <div>
    <FileListReact
      files={this.state.files} 
      activeFile={this.state.activeFile}
      callbackActivate={this.onActivate}
    />
    <Log log={this.state.log} />
  </div>
  );

  }
});

var FileListItem = React.createClass({
  render: function() {
    return <span>{this.props.file.name}</span>;
  }
});

var FileListReact = React.createClass({
  onClick: function(index){
    console.log('onClick');
    this.props.callbackActivate(this.props.files[index]._id);
  },
  render: function(){
    console.log ('filelist', this.props.files, this.props.activeFile);
    var that = this;
    var files = this.props.files.map(function(file, i){
    console.log('this.props.', that.props.activeFile);
    return (
      <li onClick={this.onClick.bind(this, i)}
        className={that.props.activeFile === file._id ? 'active' :  ''}
        key={i}>
        <FileListItem file={file} />
      </li>
    );
    }, this);
    return (
      <ul className='file-list' id="files-logs">{files}</ul>
    );
  }
});


var Log = React.createClass({
  render: function (){
    var log = this.props.log.map(function(line, i){
      return <li key={line._id}>{line.lineText}</li>;
    });
    return <ul className="log">{log}</ul>;
}
});

// React.render(new App({}), document.getElementById('starter-template'));
React.render(new App({}), document.body);
