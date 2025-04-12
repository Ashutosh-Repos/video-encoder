"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  email: z.string().email(),
  feedback: z.string(),
});

export default function Page() {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [submitProgrees, setSubmitProgrees] = useState<boolean>(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      feedback: "",
    },
    mode: "onChange",
  });

  const sendEmail = (formElement: HTMLFormElement) => {
    setSubmitProgrees(true);
    emailjs
      .sendForm("service_w11v9a3", "template_j8hv24r", formElement, {
        publicKey: "yj5LmGePE38qEaIKu",
      })
      .then(
        () => {
          console.log("SUCCESS!");
          toast("Feedback received 🙌");
          setSubmitProgrees(false);
        },
        (error) => {
          console.error("FAILED...", error.text);
          toast("Something went wrong while sending feedback ❌");
          setSubmitProgrees(false);
        }
      );
  };

  const onSubmit = () => {
    if (formRef.current) {
      sendEmail(formRef.current);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-3.6rem)] grid place-items-center p-8">
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-96 space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    // important for emailjs
                    placeholder="example@outlook.com"
                    {...field}
                    className="backdrop-blur-sm"
                  />
                </FormControl>
                <FormDescription className="text-zinc-300 text-xs px-2">
                  Your feedback will be sent via email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feedback</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    name="feedback"
                    placeholder="Your feedback is valuable for me."
                    className={cn(
                      "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    )}
                    rows={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {submitProgrees ? (
            <Button disabled>
              <Loader2 className="animate-spin" />
              Submitting
            </Button>
          ) : (
            <Button type="submit" className="cursor-pointer">
              Submit
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
