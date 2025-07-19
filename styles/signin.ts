import { StyleSheet } from 'react-native'

export const Signinstyles = StyleSheet.create({
  Title:{
    fontSize:24,
    fontFamily: 'Poppins-Medium',
    color:"white",
    textAlign:"center"
  },
  Text:{
    fontSize:14,
    fontFamily: 'Poppins-Light',
    color:"#B0B0B0",
    textAlign:"center"
  },
  Text16R:{
    fontSize:16,
    fontFamily: 'Poppins-Regular',
    color:"#B0B0B0",
    textAlign:"center"
  },
  Text16M:{
    fontSize:16,
    fontFamily: 'Poppins-Medium',
    color:"white",
    textAlign:"center"
  },
  Container:{
    height:"100%",
    display:"flex",
    gap:25,
    alignItems:"center",
    alignContent:"center",
    justifyContent:"center",
    textAlign:"center"
  },
  button:{
    width:333,
    height:55,
    fontSize:16,
    fontFamily: 'Inter-Light',
    display:"flex",
    justifyContent:'center',
    alignItems:"center",
    backgroundColor:"#363636",
    color:"white",
    borderRadius:8
  }
})