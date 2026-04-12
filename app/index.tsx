import RazorpayCheckout from "react-native-razorpay";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Alert } from "react-native";