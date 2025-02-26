import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import VehicleForm from "@/components/VehicleForm";
import { createClient } from "@/utils/supabase/component";

export default function Add() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string>("");

  const handleSave = async () => {
    router.push("/vehicles");
  };

  const fetchUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      console.error("Get user error:", error);
    }
    if (data.user) {
      setUserId(data.user.id);
    } else {
      router.push("/auth");
    }
  }, [router, supabase.auth]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Layout>
      <div className="bg-background-card p-6 shadow-lg rounded-lg">
        <VehicleForm userId={userId} onSave={handleSave} />
      </div>
    </Layout>
  );
}
