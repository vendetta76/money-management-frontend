import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import Tour from '@/components/Tour';

const TourTrigger = () => {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const checkTourStatus = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return;

      const uid = user.uid;
      const db = getFirestore();
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      const isNewUser =
        user.metadata.creationTime === user.metadata.lastSignInTime;
      const hasSeenLocal = localStorage.getItem(`tour_seen_${uid}`);
      const hasSeenRemote = docSnap.exists() && docSnap.data().tourCompleted;

      if (isNewUser && !hasSeenLocal && !hasSeenRemote) {
        setRunTour(true);
        localStorage.setItem(`tour_seen_${uid}`, 'true');
        await setDoc(docRef, { tourCompleted: true }, { merge: true });
      }
    };

    checkTourStatus();
  }, []);

  return <Tour run={runTour} onEnd={() => setRunTour(false)} />;
};

export default TourTrigger;