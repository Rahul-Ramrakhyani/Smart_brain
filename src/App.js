import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Particles from 'react-particles-js';
import Logo from './components/Logo/Logo';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import './App.css';

const particlesOptions = {
  particles: {
   number: {
     value: 200,
     density: {
      enable: true,
      value_area: 1500
   }
  },
      "color": {
      "value": "#ffffff"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": {
        "enable": true,
        "speed": 2,
        "opacity_min": 0.1,
        "sync": true
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 40,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed":5,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 1200,
        "rotateY": 1200
      }
    }
  }
}

const initialState =
{
      input:'',
      imageUrl:'',
      box:[],
      route:'signin',
      isSignedIn:false,
      user:{
        id:'',
        name:'',
        email:'',
        entries:0,
        joined:''
      }
    }
class App extends Component {
  constructor() {
    super();
    this.state =initialState;
}

loadUser = (data) => {
  this.setState({user: {
    id:data.id,
    name:data.name,
    email:data.email,
    entries:data.entries,
    joined:data.joined
  }})
}
  
  calculateFaceLocation = (data) => {

    const image = document.getElementById('inputimage') 
    const width = Number(image.width);
    const height = Number(image.height);

    const clarifaiFaces = data.outputs[0].data.regions;
    const facesArray = []
    clarifaiFaces.forEach((element)=>{
      const clarifaiFace = element.region_info.bounding_box;
      facesArray.push({
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
      })
    })

    return facesArray;

  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('https://intelligent-face-recognition.herokuapp.com/imageurl',{
        method: 'post',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({
          input:this.state.input
        })
      })  
    .then(response => response.json())
    .then(response => {
    if (response) {
      fetch('https://intelligent-face-recognition.herokuapp.com/image',{
        method: 'put',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({
          id:this.state.user.id
        })
      })

       .then(response => response.json())
       .then(count => { 
        this.setState(Object.assign(this.state.user, {entries: count}))
       })
       .catch(console.log) 
    }
    this.displayFaceBox(this.calculateFaceLocation(response))
  })
  .catch(err => console.log(err));
}

onRouteChange =(route) => {
  if(route === 'signout') {
    this.setState(initialState)
  }else if (route === 'home'){
    this.setState({isSignedIn: true})
  }
  this.setState({route: route});
  }
  render(){
  return (
    <div className="App">
      <Particles className='particles'
       params={particlesOptions}
      />
       <Navigation isSignedIn={this.state.isSignedIn}onRouteChange={this.onRouteChange}/>
      { this.state.route === 'home'  
        ? 
        <div> 
          <Logo />
          <Rank
          name={this.state.user.name} 
          entries={this.state.user.entries}
          />
          <ImageLinkForm 
           onInputChange={this.onInputChange}
           onButtonSubmit={this.onButtonSubmit}
           />
          <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
        </div>
        :(
          this.state.route === 'signin'
          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>

          )
      }
    </div>
  );
}
}
export default App;
